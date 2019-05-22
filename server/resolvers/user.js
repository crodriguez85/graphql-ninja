const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

//Creating JWT
const createToken = (user, secret, expiresIn) => {
  const { id, name, username } = user;
  return jwt.sign({ id, name, username }, secret, { expiresIn }); 
}

// parent, args, context, info
const resolvers = {
    Query: {
      users: (parent, args, { models }) => {
        return models.User.findAll();
      },
      user: (parent, { id }, { models }) => {
        return models.User.findByPk(id);
      },
      //me: (parent, args, { me }) => me
    },
    Mutation: {
      makeUser: (parent, { name }, { models }) => {
        const user = {
          name
        };
        return models.User.create(user);
      },
      removeUser: (parent, { id }, { models }) => {
        return models.User.destroy({
          where: {
            id
          }
        });
      },
      register: async (parent, { name, username, password }, { models }) => {
        const user = {
          name,
          username,
          password
        };
        const registeredUser = await models.User.create(user);
        try{
          if(typeof registeredUser.id === 'number'){
            return true;
          } else {
            return false;
          }

        } catch(error) {
          console.error(error);
          return false;
        }
      },
      login: async (parent, { username, password } , { models, secret }) => {
        const user = await models.User.findOne({where: {username}});
        if(!user) {
          throw new Error('User Not Found')
        }
        const validPassword = await user.validatePassword(password) 

        if(!validPassword) {
          throw new Error('Password Incorrect')
        }
        return {
          token: createToken(user, secret, '30m')
        }
      }
    },
    User: {
      car: (parent, args, { models }) => {
        return models.Car.findAll({
          where: {
            userId: parent.id
          }
        });
      }
    }
  };
  
  module.exports = resolvers;