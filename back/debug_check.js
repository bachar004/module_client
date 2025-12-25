const mongoose = require('mongoose');
require('dotenv').config();

// Connect to DB (mocking connection or just verifying schema)
// actually we don't need to connect to verify schema, just load models.

try {
    console.log("Loading models...");
    require('./models/client');
    require('./models/ticket');

    console.log("Registered Models:", mongoose.modelNames());

    const Ticket = mongoose.model('Ticket');
    const Client = mongoose.model('clients'); // Should be 'clients'

    console.log("Ticket Model found.");
    console.log("Client Model found (as 'clients').");

    console.log("Ticket Schema 'client' path ref:", Ticket.schema.path('client').options.ref);

    if (Ticket.schema.path('client').options.ref !== 'clients') {
        console.error("FAIL: Ticket ref is NOT 'clients'");
    } else {
        console.log("PASS: Ticket ref is 'clients'");
    }

} catch (e) {
    console.error("ERROR:", e.message);
}
process.exit(0);
