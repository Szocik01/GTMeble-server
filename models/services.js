const db = require("../utils/database");

class Service{
    constructor(content){
        this.content = content;
    }

    save()
    {
        return db.execute("Insert into services (content) values (?)",[this.content]);
    }

    static getService()
    {
        return db.execute("Select * from services limit 1");
    }

    static editServiceById(id, content)
    {
        return db.execute('Update services set content=? where id=?',[content ,id]);
    }
}

module.exports = Service;