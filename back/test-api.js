// Script de test pour l'API des commandes
// Utilisation: node test-api.js

const BASE_URL = 'http://localhost:3000/api';

// Test 1: Créer un client de test
async function creerClientTest() {
  try {
    const response = await fetch(`${BASE_URL}/clients/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: 'Test',
        prenom: 'Client',
        email: `test${Date.now()}@example.com`,
        telephone: '12345678',
        statut: 'actif',
        adresse: {
          rue: '123 Rue Test',
          ville: 'Tunis',
          codePostal: '1000',
          pays: 'Tunisie'
        }
      })
    });
    
    const data = await response.json();
    console.log('✅ Client créé:', data._id);
    return data._id;
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    return null;
  }
}

// Test 2: Créer une commande
async function creerCommandeTest(clientId) {
  try {
    const response = await fetch(`${BASE_URL}/commandes/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: clientId,
        articles: [
          {
            produit: 'Produit Test 1',
            quantite: 2,
            prixUnitaire: 50
          },
          {
            produit: 'Produit Test 2',
            quantite: 1,
            prixUnitaire: 100
          }
        ],
        notes: 'Commande de test'
      })
    });
    
    const data = await response.json();
    console.log('✅ Commande créée:', data.commande.numeroCommande);
    return data.commande._id;
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    return null;
  }
}

// Test 3: Récupérer toutes les commandes
async function listerCommandes() {
  try {
    const response = await fetch(`${BASE_URL}/commandes/findall`);
    const data = await response.json();
    console.log(`✅ ${data.length} commande(s) récupérée(s)`);
    return data;
  } catch (error) {
    console.error('❌ Erreur liste commandes:', error);
    return [];
  }
}

// Test 4: Valider une commande
async function validerCommande(commandeId) {
  try {
    const response = await fetch(`${BASE_URL}/commandes/valider/${commandeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('✅ Commande validée:', data.commande.statut);
    return true;
  } catch (error) {
    console.error('❌ Erreur validation commande:', error);
    return false;
  }
}

// Test 5: Annuler une commande
async function annulerCommande(commandeId) {
  try {
    const response = await fetch(`${BASE_URL}/commandes/annuler/${commandeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raisonAnnulation: 'Test d\'annulation'
      })
    });
    
    const data = await response.json();
    console.log('✅ Commande annulée:', data.commande.statut);
    return true;
  } catch (error) {
    console.error('❌ Erreur annulation commande:', error);
    return false;
  }
}

// Test 6: Statistiques
async function obtenirStatistiques() {
  try {
    const response = await fetch(`${BASE_URL}/commandes/stats/overview`);
    const data = await response.json();
    console.log('✅ Statistiques:');
    console.log('  - Total commandes:', data.totalCommandes);
    console.log('  - En attente:', data.commandesEnAttente);
    console.log('  - Validées:', data.commandesValidees);
    console.log('  - Annulées:', data.commandesAnnulees);
    console.log('  - Montant total:', data.montantTotal, 'DT');
    return data;
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    return null;
  }
}

// Exécution des tests
async function executerTests() {
  console.log('🚀 Début des tests API\n');
  
  // Test 1: Créer un client
  console.log('Test 1: Création d\'un client');
  const clientId = await creerClientTest();
  if (!clientId) return;
  console.log('');
  
  // Test 2: Créer une commande
  console.log('Test 2: Création d\'une commande');
  const commandeId = await creerCommandeTest(clientId);
  if (!commandeId) return;
  console.log('');
  
  // Test 3: Lister les commandes
  console.log('Test 3: Liste des commandes');
  await listerCommandes();
  console.log('');
  
  // Test 4: Valider la commande
  console.log('Test 4: Validation de la commande');
  await validerCommande(commandeId);
  console.log('');
  
  // Test 5: Créer une autre commande pour l'annuler
  console.log('Test 5: Création d\'une commande à annuler');
  const commandeId2 = await creerCommandeTest(clientId);
  if (commandeId2) {
    await annulerCommande(commandeId2);
  }
  console.log('');
  
  // Test 6: Statistiques
  console.log('Test 6: Statistiques');
  await obtenirStatistiques();
  console.log('');
  
  console.log('✅ Tests terminés avec succès!');
}

// Lancer les tests
executerTests();