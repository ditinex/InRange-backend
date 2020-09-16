
global.config = {
    apiurl: 'http://localhost:3001',
    user_id: null,
    access_token: null
}

describe("\n\n--- Setting Test Environment. ---", require('./setup').Test)
describe("\n\n--- Admin API tests. ---", require('./admin').Test)