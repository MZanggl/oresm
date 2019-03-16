var expect = require('chai').expect;
const { Model } = require('../dist/oresm');
const Helper = require('../dist/helper');

const helper = new Helper();

describe('helper', function() {
    it('should have users endpoint with default settings', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        expect(helper.constructEndpoint(user)).to.equal('/users');
    });

    it('should have /api/users endpoint with api prefix', function() {
        class User extends Model {
            get prefix() {
                return 'api';
            }
        }

        const user = new User({
            id: 1
        });
        expect(helper.constructEndpoint(user)).to.equal('/api/users');
    });

    it('should have http://127.0.0.1/api/users endpoint with api prefix and host set', function() {
        class User extends Model {
            get prefix() {
                return 'api';
            }
            get host() {
                return 'http://127.0.0.1';
            }
        }

        const user = new User({
            id: 1
        });
        expect(helper.constructEndpoint(user)).to.equal(
            'http://127.0.0.1/api/users'
        );
    });

    it('should have users/1 endpoint when constructing endpoint with key', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        expect(helper.constructEndpointWithKey(user)).to.equal('/users/1');
    });

    it('should have users/1 endpoint when constructing endpoint with custom key', function() {
        class User extends Model {
            get key() {
                return 'user_id';
            }
        }

        const user = new User({
            user_id: 1
        });
        expect(helper.constructEndpointWithKey(user)).to.equal('/users/1');
    });

    it('should have users/1 endpoint when constructing endpoint with key', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        expect(helper.constructEndpointWithKey(user)).to.equal('/users/1');
    });

    it('should freeze object', function() {
        class User extends Model {}
        const options = {
            id: 1
        };
        const user = new User(options);
        helper.destroy(user);

        expect(Object.isFrozen(user)).to.be.true;
    });

    it('is not new when key is set', function() {
        class User extends Model {}
        const options = {
            id: 1
        };
        const user = new User(options);

        expect(helper.isNew(user)).to.be.false;
    });

    it('is new when key is not set', function() {
        class User extends Model {}
        const options = {
            name: 1
        };
        const user = new User(options);

        expect(helper.isNew(user)).to.be.true;
    });

    it('should get users resource', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        expect(helper.getResource(user)).to.equal('users');
    });

    it('should throw error when object is frozen', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        Object.freeze(user);
        expect(helper.checkAction.bind(user)).to.throw(
            Error,
            'action not allowed'
        );
    });

    it('should throw error when not passing array', function() {
        class User extends Model {}

        const data = 'not an array';
        expect(helper.collect.bind(User, data)).to.throw(
            Error,
            'documents is not an array'
        );
    });

    it('should throw error when trying to change PK', function() {
        class User extends Model {}

        const user = new User({
            id: 1
        });
        expect(() => {
            user.id = 2;
        }).to.throw(Error, 'cannot update key');
    });

    it('should set entity', function() {
        class User extends Model {}

        const user = new User();
        const data = {
            id: 1
        };

        helper.setEntity(user, data);

        expect(user._entity).to.deep.equal(data);
    });

    it('should affect _entity when setting value directly', function() {
        class User extends Model {}

        const data = {
            id: 1,
            username: 'old'
        };

        const user = new User(data);

        user.username = 'new';

        expect(user._entity.username).to.equal('new');
    });

    it('should return collection', function() {
        class User extends Model {}

        const data = [{ id: 1 }, { id: 2 }];
        expect(helper.collect(User, data)).to.be.an.instanceof(Array);
    });

    it('should update new entity', function() {
        class User extends Model {}

        const user = new User({
            id: 1,
            username: 'test'
        });

        const data = {
            lastname: 'lastname'
        };

        helper.updateEntity(user, data);

        expect(user._entity).to.deep.equal({
            id: 1,
            lastname: 'lastname',
            username: 'test'
        });
    });

    it('should add key to dirty list when setting values', function() {
        class User extends Model {}

        const user = new User({
            id: 1,
            username: '111'
        });

        expect(user._dirty).to.deep.equal(['id', 'username']);
    });
});
