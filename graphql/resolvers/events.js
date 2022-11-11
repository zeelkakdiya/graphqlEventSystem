const Event = require('../../models/event');
const User = require('../../models/user');

const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },

  event: async (args) => {
    console.log(args);
    const event = await Event.findOne({ title: args.title, _id: args._id });

    const events = await Event.find({ title: args.title, _id: args._id });

    if (!event) {
      throw new Error('Not found Event');
    }

    // return events.map((event) => {
    //   console.log(event);
    //   return transformEvent(event);
    // });

    return transformEvent(event);
    // return events.map((event) => {
    //   return { ...event._doc, _id: event._id };
    // });
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId,
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
