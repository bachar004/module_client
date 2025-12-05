const pool=require("../database/db")
module.exports.ajoutclient= async (req, res) => {
    try {
        const { nom, prenom, email, telephone, adresse,statut } = req.body
        if(!nom || !prenom || !email) {
            return res.status(400).json({ message: "Nom prenom email sont obligatoires" });
        }
        const sql="insert into clients (nom, prenom, email, telephone, adresse, statut) values (?, ?, ?, ?, ?, ?)"
        const [insertedid]=await pool.query(sql,[nom, prenom, email,telephone, adresse,statut])
        res.status(200).json({"client ajouté avec succées":insertedid.insertId})
    } catch (error) {
        res.status(500).json({"message":error.message})
    }
}
module.exports.listeclients = async (req, res) => {
    try {
        const sql="select * from clients"
        const [rows] = await pool.query(sql)
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
module.exports.clientbyid = async (req, res) => {
    try {
        const sql="select * from clients where id=?"
        const [rows] = await pool.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "client non trouvé" });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports.updateclient = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, adresse, statut } = req.body;
        await pool.query(
            "update clients set nom=?, prenom=?, email=?, telephone=?, adresse=?, statut=? where id=?",
            [nom, prenom, email, telephone, adresse, statut, req.params.id]
        );
        res.status(200).json({ message: "client maj" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.desactiverclient = async (req, res) => {
    try {
        await pool.query("update clients set statut='inactif' where id=?", [req.params.id]);
        res.status(200).json({ message: "client desactive" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports.activerclient = async (req, res) => {
    try {
        await pool.query("update clients set statut='actif' where id=?", [req.params.id]);
        res.status(200).json({ message: "client active" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};