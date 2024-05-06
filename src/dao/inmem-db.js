//
// Onze lokale 'in memory database'.
// We simuleren een asynchrone database met een array van objecten.
// De array bevat een aantal dummy records.
// De database heeft twee methoden: get en add.
// Opdracht: Voeg de overige methoden toe.
//
const database = {
    // het array met dummy records. Dit is de 'database'.
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAdress: 'h.vd@server.nl',
            // Hier de overige velden uit het functioneel ontwerp
            isActive: true,
            password: 'Secret12',
            phoneNumber: '0612345678',
            roles: ['student'],
            street: 'Lovendijkstraat',
            city: 'Breda'
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm.jn@server.nl',
            // Hier de overige velden uit het functioneel ontwerp
            isActive: true,
            password: 'Secret14',
            phoneNumber: '0687654321',
            roles: ['student'],
            street: 'Lovendijkstraat',
            city: 'Breda'
        },
        {
            id: 2,
            firstName: 'Zaid',
            lastName: 'Karmoudi',
            emailAdress: 'z.karmoudi@server.nl',
            password: 'Secret12',
            isActive: false,
            street: 'Lovensdijkstraat',
            city: 'Breda',
            phoneNumber: '06 12312345',
            roles: []
        }
    ],

    // Ieder nieuw item in db krijgt 'autoincrement' index.
    // Je moet die wel zelf toevoegen aan ieder nieuw item.
    _index: 3,
    _delayTime: 500,

    getAll(callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Roep de callback aan, en retourneer de data
            callback(null, this._data)
        }, this._delayTime)
    },

    getById(id, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null)
            } else {
                callback(null, this._data[id])
            }
        }, this._delayTime)
    },

    add(item, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Voeg een id toe en voeg het item toe aan de database
            item.id = this._index++
            // Voeg item toe aan de array
            this._data.push(item)

            // Roep de callback aan het einde van de operatie
            // met het toegevoegde item als argument, of null als er een fout is opgetreden
            callback(null, item)
        }, this._delayTime)
    },

    update(id, userData, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                const error = {
                    message: `Error: id ${id} does not exist!`,
                    status: 404
                }
                callback(error, null)
            } else {
                for (let field in userData) {
                    if (field !== 'id') {
                        this._data[id][field] = userData[field]
                    }
                }

                callback(null, this._data[id])
            }
        }, this._delayTime)
    },

    delete(id, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                const error = {
                    message: `Error: id ${id} does not exist!`,
                    status: 404
                }
                callback(error, null)
            } else {
                const deletedUser = this._data.splice(id, 1)[0]
                callback(null, deletedUser)
            }
        }, this._delayTime)
    }
}

module.exports = database
// module.exports = database.index;
