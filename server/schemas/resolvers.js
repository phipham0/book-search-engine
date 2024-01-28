const { User } = require('../models');

const resolvers = {
  Query: {
    users: async () => {
      return User.find({});
    },
    user: async (parent, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('Not logged in');
    }
  },

  Mutation: {
    addUser: async (parent, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user);

      return { token, user };
    },
    updateUser: async (parent, args, context) => {
      // create possible inputs
      const {
        username,
        email,
        password,
        gamerTag,
        console,
        profilePic,
        timePreferences,
        gamePreferences,
        userbio,
        country,
      } = args;

      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      try {
        // Find the user
        const user = await User.findById(context.user._id);

        // Update the field with the new information if there is any
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password;
        if (gamerTag) user.gamerTag = gamerTag;
        if (console) user.console = console;
        if (profilePic) user.profilePic = profilePic;
        if (timePreferences) user.timePreferences = timePreferences;
        if (gamePreferences) user.gamePreferences = gamePreferences;
        if (userbio) user.userbio = userbio;
        if (country) user.country = country;

        // Save the updated user
        await user.save();

        return user;
      } catch (error) {
        throw new Error('Failed to update user');
      }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    addFriend: async (parent, { userId, friend }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          {
            $addToSet: { friends: friend },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw AuthenticationError;
    },
    removeFriend: async (parent, { friend }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { friends: friend } },
          { new: true }
        );
      }
      throw AuthenticationError;
    },
    addRival: async (parent, { userId, rival }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          {
            $addToSet: { rivals: rival },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw AuthenticationError;
    },
    removeRival: async (parent, { rival }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { rivals: rival } },
          { new: true }
        );
      }
      throw AuthenticationError;
    },
    removeUser: async (parent, args, context) => {
      if (context.user) {
        return User.findOneAndDelete({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
};


module.exports = resolvers;
