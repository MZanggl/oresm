const chai = require('chai')
const expect = chai.expect
const { Model } = require('../src/oresm')


function fetchSpyFactory() {
    let fetchResponse = {}
    fetch = async (endpoint, parameters) => {
        return {
            ok: true,
            async json() {
                parameters.body = parameters.body ? JSON.parse(parameters.body) : {},
                fetchResponse = {
                    meta: {
                        endpoint,
                        parameters,
                    },
                }
    
                // return dummy data
                return {
                    id: 1,
                    username: 'test',
                }
            }
        }
    }

    return async action => {
        await action()
        return fetchResponse
    }
}

describe('default model', function () {

    it('should use POST verb when entity does not have an id', async function () {
        class User extends Model {}
        const user = new User({
            name: 'test'
        })

        const fetchSpy = fetchSpyFactory()

        const fetchResponse = await fetchSpy(() => user.save())
        expect(fetchResponse.meta.parameters.method).to.equal('post')
    });

    it('should use PUT verb when entity has an ID', async function () {
        class User extends Model {}
        const user = new User({
            id: 1,
            name: 'test'
        })

        const fetchSpy = fetchSpyFactory()

        const fetchResponse = await fetchSpy(() => user.save())
        expect(fetchResponse.meta.parameters.method).to.equal('put')
    });

    it('should have property id', function () {
        class User extends Model {}
        const user = new User({
            id: 1,
        })
        expect(user).to.have.property('id')
    });
    it('should have a resource noun named users', function () {
        class User extends Model {}
        const user = new User({
            id: 1,
        })
        expect(user.resource).to.equal('users')
    });

    it('should get copy of entity', function() {
        class User extends Model {}
        const options = {
            id: 1,
        }
        const user = new User(options)

        const entity = user.getEntity()
        expect(entity).to.deep.equal(options)
    });

    it('should not allow to just add new properties', function () {
        class User extends Model {}

        const data = {
            id: 1,
        }

        const user = new User(data)
        user.username = 'new'
        expect(user._entity.username).to.be.undefined
    });

    it('should patch dirty fields', async function () {
        class User extends Model {}

        const data = {
            username: 'test',
        }

        const user = new User(data)

        const fetchSpy = fetchSpyFactory()

        const fetchResponse = await fetchSpy(async () => {
            await user.save()
            await user.patch({ type: 1})
        })

        expect(fetchResponse.meta.parameters.body).to.deep.equal({
            type: 1,
        })
    });

    it('should throw error when trying to update entity without key', async function() {
        class User extends Model {}

        const user = new User({
            username: 'test'
        })
        
        const response = await user.patch().catch(e => e)

        expect(response).to.be.instanceOf(Error)
    })
    // add test for update when key is not set
});