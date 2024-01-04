const AppError = require("../utils/AppError");

class UsersController {
  create(request, response) {
    const {name, email, password} = request.body;

    if(!name) {
      throw new AppError("Name is obligatory.");
    }

    // response.send(`Name: ${name}. E-mail: ${email}. Password: ${password}.`);
    response.status(201).json({name, email, password});
  };
};

module.exports = UsersController;