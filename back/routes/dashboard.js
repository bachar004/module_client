const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const Commande = require('../models/commande');
const Facture = require('../models/facture');
const Paiement = require('../models/paiement');
const Ticket = require('../models/ticket');
const Echeance = require('../models/echeance');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get all dashboard statistics
 * @access  Public (add auth middleware if needed)
 */
router.get('/stats', async (req, res) => {
  try {
    // ========================================
    // 1. KEY METRICS
    // ========================================
    
    // Total Revenue (sum of paid amounts from invoices)
    const totalRevenueData = await Facture.aggregate([
      { $match: { statut: { $ne: 'impayee' } } },
      { $group: { _id: null, total: { $sum: '$montantPaye' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // Active Clients Count
    const activeClients = await Client.countDocuments({ statut: 'actif' });

    // Pending Orders (en_attente, validee, en_cours)
    const pendingOrders = await Commande.countDocuments({
      statut: { $in: ['en_attente', 'validee', 'en_cours'] }
    });

    // Unpaid Invoices (amount and count)
    const unpaidInvoicesData = await Facture.aggregate([
      { $match: { statut: { $in: ['impayee', 'partiellement_payee'] } } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$soldeRestant' },
          count: { $sum: 1 }
        }
      }
    ]);
    const unpaidInvoices = {
      amount: unpaidInvoicesData[0]?.total || 0,
      count: unpaidInvoicesData[0]?.count || 0
    };

    // ========================================
    // 2. REVENUE CHART (Last 12 months)
    // ========================================
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueByMonth = await Paiement.aggregate([
      {
        $match: {
          datePaiement: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$datePaiement' },
            month: { $month: '$datePaiement' }
          },
          total: { $sum: '$montant' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // ========================================
    // 3. PAYMENT DISTRIBUTION
    // ========================================
    const paymentDistribution = await Paiement.aggregate([
      {
        $group: {
          _id: '$modePaiement',
          total: { $sum: '$montant' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // ========================================
    // 4. INVOICE STATUS DISTRIBUTION
    // ========================================
    const invoiceStatus = await Facture.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
          total: { $sum: '$montantTotal' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // ========================================
    // 5. RECENT ACTIVITIES
    // ========================================
    
    // Recent Orders
    const recentOrders = await Commande.find()
      .populate('client', 'nom prenom')
      .sort({ dateCommande: -1 })
      .limit(3)
      .lean();

    // Recent Payments
    const recentPayments = await Paiement.find()
      .populate('client', 'nom prenom')
      .populate('facture', 'numeroFacture')
      .sort({ datePaiement: -1 })
      .limit(3)
      .lean();

    // Recent Invoices
    const recentInvoices = await Facture.find()
      .populate('client', 'nom prenom')
      .sort({ dateFacture: -1 })
      .limit(3)
      .lean();

    // Recent Clients
    const recentClients = await Client.find()
      .sort({ dateCreation: -1 })
      .limit(2)
      .lean();

    // Recent Tickets
    const recentTickets = await Ticket.find()
      .populate('client', 'nom prenom')
      .sort({ dateCreation: -1 })
      .limit(2)
      .lean();

    // Combine and sort all activities by date
    const activities = [
      ...recentOrders.map(o => ({ 
        type: 'order', 
        data: o, 
        date: o.dateCommande 
      })),
      ...recentPayments.map(p => ({ 
        type: 'payment', 
        data: p, 
        date: p.datePaiement 
      })),
      ...recentInvoices.map(i => ({ 
        type: 'invoice', 
        data: i, 
        date: i.dateFacture 
      })),
      ...recentClients.map(c => ({ 
        type: 'client', 
        data: c, 
        date: c.dateCreation 
      })),
      ...recentTickets.map(t => ({ 
        type: 'ticket', 
        data: t, 
        date: t.dateCreation 
      }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

    // ========================================
    // 6. TOP 5 CLIENTS BY REVENUE
    // ========================================
    const topClients = await Facture.aggregate([
      {
        $group: {
          _id: '$client',
          totalRevenue: { $sum: '$montantPaye' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $lookup: {
          from: 'commandes',
          let: { clientId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$client', '$$clientId'] } } },
            { $sort: { dateCommande: -1 } },
            { $limit: 1 },
            { $project: { dateCommande: 1 } }
          ],
          as: 'lastOrder'
        }
      },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          orderCount: 1,
          clientInfo: {
            nom: 1,
            prenom: 1,
            statut: 1
          },
          lastOrder: 1
        }
      }
    ]);

    // ========================================
    // 7. ALERTS & NOTIFICATIONS
    // ========================================
    
    // Overdue Invoices (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const overdueInvoices = await Facture.countDocuments({
      statut: { $in: ['impayee', 'partiellement_payee'] },
      dateFacture: { $lt: thirtyDaysAgo }
    });

    // Pending Echeances (within next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const pendingEcheances = await Echeance.countDocuments({
      status: 'pending',
      executeAt: { $lte: sevenDaysLater }
    });

    // Open Tickets
    const openTickets = await Ticket.countDocuments({
      statut: { $in: ['OUVERT', 'EN_COURS'] }
    });

    // Suspended Clients
    const suspendedClients = await Client.countDocuments({
      statut: 'suspendu'
    });

    // Orders Awaiting Validation
    const ordersAwaitingValidation = await Commande.countDocuments({
      statut: 'en_attente'
    });

    // ========================================
    // 8. MONTHLY COMPARISON (This Month vs Last Month)
    // ========================================
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // This Month Statistics
    const thisMonthNewClients = await Client.countDocuments({
      dateCreation: { $gte: startOfThisMonth }
    });

    const thisMonthNewOrders = await Commande.countDocuments({
      dateCommande: { $gte: startOfThisMonth }
    });

    const thisMonthRevenueData = await Paiement.aggregate([
      { $match: { datePaiement: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$montant' } } }
    ]);

    const thisMonthPayments = await Paiement.countDocuments({
      datePaiement: { $gte: startOfThisMonth }
    });

    // Last Month Statistics
    const lastMonthNewClients = await Client.countDocuments({
      dateCreation: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });

    const lastMonthNewOrders = await Commande.countDocuments({
      dateCommande: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });

    const lastMonthRevenueData = await Paiement.aggregate([
      { 
        $match: { 
          datePaiement: { 
            $gte: startOfLastMonth, 
            $lt: startOfThisMonth 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$montant' } } }
    ]);

    const lastMonthPayments = await Paiement.countDocuments({
      datePaiement: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });

    // ========================================
    // FINAL RESPONSE
    // ========================================
    res.json({
      success: true,
      data: {
        metrics: {
          totalRevenue,
          activeClients,
          pendingOrders,
          unpaidInvoices
        },
        revenueChart: revenueByMonth,
        paymentDistribution,
        invoiceStatus,
        recentActivities: activities,
        topClients,
        alerts: {
          overdueInvoices,
          pendingEcheances,
          openTickets,
          suspendedClients,
          ordersAwaitingValidation
        },
        monthlyComparison: {
          thisMonth: {
            newClients: thisMonthNewClients,
            newOrders: thisMonthNewOrders,
            revenue: thisMonthRevenueData,
            payments: thisMonthPayments
          },
          lastMonth: {
            newClients: lastMonthNewClients,
            newOrders: lastMonthNewOrders,
            revenue: lastMonthRevenueData,
            payments: lastMonthPayments
          }
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du tableau de bord',
      error: error.message
    });
  }
});

module.exports = router;