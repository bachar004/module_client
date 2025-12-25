// Script de test pour le module SAV (Tickets)
// Utilisation: node test-ticket-flow.js

const BASE_URL = 'http://127.0.0.1:3000/api';
let CLIENT_ID = null;
let TICKET_ID = null;

// Helper pour afficher les titres
function logStep(step) {
    console.log(`\n-----------------------------------`);
    console.log(`🔷 ${step}`);
    console.log(`-----------------------------------`);
}

// 1. Récupérer un client existant ou en créer un pour le test
async function getClient() {
    logStep('1. Préparation Client');
    try {
        // Essayer de lister pour en prendre un
        const res = await fetch(`${BASE_URL}/clients/findall`);
        const clients = await res.json();
        if (clients.length > 0) {
            CLIENT_ID = clients[0]._id;
            console.log(`✅ Client trouvé: ${clients[0].nom} (${CLIENT_ID})`);
        } else {
            // Créer un client si aucun
            console.log('⚠️ Aucun client trouvé. Création d\'un client test...');
            const createRes = await fetch(`${BASE_URL}/clients/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: 'TestSAV', prenom: 'User', email: 'sav@test.com', telephone: '00000000'
                })
            });
            const newClient = await createRes.json();
            CLIENT_ID = newClient._id;
            console.log(`✅ Client créé: ${CLIENT_ID}`);
        }
    } catch (e) {
        console.error('❌ Erreur récupération client', e.message);
    }
}

// 2. Créer un Ticket
async function createTicket() {
    logStep('2. Création Ticket (Client)');
    try {
        const res = await fetch(`${BASE_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: CLIENT_ID,
                titre: 'Problème de connexion',
                description: 'Je n\'arrive pas à me connecter à mon compte.',
                user: 'ClientPrincipal'
            })
        });
        const ticket = await res.json();
        console.log('📦 Réponse Raw:', ticket); // DEBUG

        if (ticket && ticket._id) {
            TICKET_ID = ticket._id;
            console.log(`✅ Ticket créé!`);
            console.log(`   Réf: ${ticket.reference}`);
            console.log(`   Statut: ${ticket.statut}`);
        } else {
            console.error('❌ Echec création ticket. Réponse invalide.');
        }
    } catch (e) {
        console.error('❌ Erreur création ticket', e.message);
    }
}

// 3. Assigner un Agent
async function assignAgent() {
    logStep('3. Assignation Agent (Manager)');
    try {
        const res = await fetch(`${BASE_URL}/tickets/${TICKET_ID}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent: 'AgentSupport_01' })
        });
        const ticket = await res.json();
        console.log(`✅ Agent assigné: ${ticket.agent}`);
        console.log(`   Statut: ${ticket.statut} (Devrait être EN_COURS)`);
    } catch (e) {
        console.error('❌ Erreur assignation', e.message);
    }
}

// 4. Ajouter un commentaire (Agent)
async function addCommentAgent() {
    logStep('4. Commentaire Agent (Interne)');
    try {
        const res = await fetch(`${BASE_URL}/tickets/${TICKET_ID}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: 'AgentSupport_01',
                content: 'Vérification des logs serveur en cours.',
                type: 'INTERNAL'
            })
        });
        const ticket = await res.json();
        console.log(`✅ Commentaire ajouté. Total commentaires: ${ticket.commentaires.length}`);
        const lastComment = ticket.commentaires[ticket.commentaires.length - 1];
        console.log(`   Dernier com: [${lastComment.type}] ${lastComment.content}`);
    } catch (e) {
        console.error('❌ Erreur ajout commentaire', e.message);
    }
}

// 5. Résoudre le ticket
async function resolveTicket() {
    logStep('5. Résolution Ticket (Agent)');
    try {
        const res = await fetch(`${BASE_URL}/tickets/${TICKET_ID}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                statut: 'RESOLU',
                user: 'AgentSupport_01',
                details: 'Problème identifié (mauvais mot de passe) et résolu.'
            })
        });
        const ticket = await res.json();
        console.log(`✅ Ticket Résolu.`);
        console.log(`   Statut: ${ticket.statut}`);
    } catch (e) {
        console.error('❌ Erreur résolution', e.message);
    }
}

// 6. Vérifier les stats
async function checkStats() {
    logStep('6. Vérification Statistiques (Dashboard)');
    try {
        const res = await fetch(`${BASE_URL}/tickets/stats/dashboard`);
        const stats = await res.json();
        console.log('✅ Stats récupérées:');
        console.log(stats);
    } catch (e) {
        console.error('❌ Erreur stats', e.message);
    }
}

// Lancer le flux
async function runTest() {
    await getClient();
    if (CLIENT_ID) {
        await createTicket();
        if (TICKET_ID) {
            await assignAgent();
            await addCommentAgent();
            await resolveTicket();
            await checkStats();
        }
    }
    console.log('\n🏁 Fin du test.');
}

runTest();
