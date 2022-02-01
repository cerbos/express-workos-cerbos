const contacts = [
  {
    id: "contact-1",
    name: "John Smith",
    email: "john@acme.com",
  },
  {
    id: "contact-2",
    name: "Sarah Jane",
    email: "sarah@acme.com",
  },
];

module.exports = {
  findOne: (id) => {
    return contacts.find((c) => c.id === id);
  },
  find: () => {
    return contacts;
  },
};
