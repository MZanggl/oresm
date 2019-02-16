## oresm

![logo](logo.png "")

> ObjectResourceMapper - A client ORM for REST APIs

### Installation

`npm install oresm`

### Introduction

```javascript
import User from "./Resources/User"

(async () => {
    const user = await User.find(1)

    user.username = "newName"
    await user.update()

    await user.delete()
})()
```

The above code executes the following requests.
> GET /api/users/1

> PUT /api/users/1

> DELETE /api/users/1

### Getting Started
Let's start of by creating a user model.
The following model would create endpoints like
`http://127.0.0.1/api/user`

```javascript
import { Model } from "oresm"

class User extends Model {
    get host() {
        return 'http://127.0.0.1' // defaults to empty string
    }

    get prefix() {
        return 'api' // defaults to empty string
    }

    get resource() {
        // from the example url this is the actual resource part `user`
        // defaults to lowercase plualized version of classname, in this case `users`
        return 'user'
    }

    get key() {
        // defaults to the key to be used as the identifier. E.g. when you call user.delete() it needs to find the user id to create the endpoint.
        return 'id'
    }
}

export default User
```

### GET

#### Getting a collection of documents

```javascript
const users = await User.get()
```

> GET /api/users

```javascript
const users = await User.get({ sort: 'name' })
```

> GET /api/users?sort=name

#### Getting a single document

```javascript
const user = await User.find(1)
```

> GET /api/users/1

```javascript
const users = await User.find(1, { xxx: 'yyy' })
```

> GET /api/users/1?xxx=yyy

### POST

Use `save()` to store a new document.

```javascript
const user = new User({ // set values in the constructor
    name: 'Son Goku',
    type: 2,
})

user.type = 3 // set them manually

await user.save({
    type: 4, // set them when saving
})
```

> POST /api/users

--- 

Once you have retrieved a document, you can perform delete and update operations on it.

### DELETE

```javascript
const user = await User.find(1)
await user.delete()
```

> GET /api/users/1

> DELETE /api/users/1

### PUT, PATCH

There is more than one way to update a resource, let's look at each individually. Let's imagine the `User.find(1)` returns an object that looks like this:
```javascript
{
    id: 1,
    username: 'xxx',
    type: 1
}
```

### Using `save()`

Like with POSTing resources, you can use the `save()` method to update an existing resource.

```javascript
const user = await User.find(1)
user.type = 3 // override fields like this
await user.save({
    type: 2 // override or add new fields like this
})
```

> GET /api/users/1

> PUT /api/users/1

The PUT request sends the following payload:
```
{
    id: 1,
    username: 'xxx',
    type: 2
}
```

### Using `PATCH`

We can use `patch` to update individual fields.

```javascript
const user = await User.find(1)
await user.patch({
    type: 2
})
```
> GET /api/users/1

> PATCH /api/users/1

It sends the following payload
```
{
    type: 2
}
```

### Computed / virtual fields

Let's go back to our user example

```javascript
const user = await User.find(1)
if (user.type === 2) { // if user is admin
    // do something
}
```

While this works, there is a much cleaner way of doing this. We can use the `User` object we created to have computed fields.

```javascript
import ObjectResourceMapper from "./ObjectResourceMapper"

class User extends ObjectResourceMapper {
    get isAdmin() {
        return this.type === 2
    }
}

export default User
```

And back to our script from before
```javascript
const user = await User.find(1)
if (user.isAdmin) {
    // do something
}
```

Of course you can move other logic to the model as well.

### Get raw data
Getting the raw data is easy.

```javascript
const user = await User.find(1)
const userData = user.getEntity()
```

### Configure fetch

For available configurations please check out [https://github.com/MZanggl/fetch-me-json](https://github.com/MZanggl/fetch-me-json)

```javascript
import { configureFetch } from 'oresm'

const configurations = {}
configureFetch(configurations)
```

### Limitations
You can not dynamically add new fields.
```javascript
const user = new User({
    name: 'Son Goku',
})

user.type = 3 // add new field

await user.save() // will not insert `type`
```

This could be solved using proxies in the future.
As a workaround you should do
```javascript
const user = new User({
    name: 'Son Goku',
})

await user.save({
    type: 3,
})
```