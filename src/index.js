const express = require("express");
const path = require("path");
const { collection, PORT } = require("./config/config");
// const { collection } = require("./models/user");
// const userRoutes = require("./routes/user");
const bcrypt = require("bcrypt");
const Type = require("./models/type");
const Company = require("./models/company");
const Store = require("./models/store");
const mongoose = require("mongoose");
const company = require("./models/company");

const app = express();
// convert data into json format

// app.route("/user", userRoutes);
app.use(express.json());
// Static file
app.use("public", express.static(path.join(__dirname, "../public")));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/user", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/listuser");
    const data = await response.json();
    const responseCompany = await fetch("http://localhost:3000/listcompany");
    const responseStore = await fetch("http://localhost:3000/liststore");
    const dataCompany = await responseCompany.json();
    const dataStore = await responseStore.json();
    res.render("user", { data, dataCompany, dataStore });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan saat mengambil data.");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ username: req.body.username });
    if (!check) {
      return res.send("User name cannot found");
    }
    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = req.body.password == check.password ? true : false;
    if (!isPasswordMatch) {
      return req.headers["accept"] === "application/json"
        ? res.status(401).json({ message: "Wrong password" })
        : res.send("wrong Password");
    }
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json({
        message: "Login successful",
        username: check.username,
        rule: check.rule,
      });
    } else {
      return res.render("home", {
        username: check.username,
        rule: check.rule,
      });
    }
  } catch {
    res.send("wrong Details");
  }
});

// Register User
app.post("/register", async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
    rule: req.body.rule,
    id_company: req.body.company ? req.body.company : req.body.id_company,
    id_store: req.body.store ? req.body.store : req.body.id_store,
    status: req.body.status,
  };

  if (data.rule == "admin" || data.rule == 1) {
    data.rule = 1;
  }
  if (data.id_company == "besar" || data.id_company == 2) {
    data.id_company = 2;
  }
  if (data.id_store == "besar" || data.id_store == 2) {
    data.id_store = 2;
  }
  data.status = data.status == "active" ? 1 : 0;

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ username: data.username });

  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    // Hash the password using bcrypt
    // const saltRounds = 10; // Number of salt rounds for bcrypt
    // const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // data.password = hashedPassword; // Replace the original password with the hashed one

    const userdata = await collection.insertMany(data);
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(userdata);
    } else {
      return res.render("login");
    }

    // res.render("login");
  }
});
app.post("/adduser", async (req, res) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
    rule: req.body.rule,
    id_company: req.body.company ? req.body.company : req.body.id_company,
    id_store: req.body.store ? req.body.store : req.body.id_store,
    status: req.body.status,
  };

  if (data.rule == "admin" || data.rule == 1) {
    data.rule = 1;
  }
  if (data.id_company == "besar" || data.id_company == 2) {
    data.id_company = 2;
  }
  data.status = data.status == "active" ? 1 : 0;

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ username: data.username });

  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    // Hash the password using bcrypt
    // const saltRounds = 10; // Number of salt rounds for bcrypt
    // const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    // AKVB123
    // data.password = hashedPassword; // Replace the original password with the hashed one

    const userdata = await collection.insertMany(data);
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(userdata);
    } else {
      return res.redirect("/user");
    }
    // res.render("login");
  }
});

app.post("/edituser", async (req, res) => {
  const { id } = req.body; // Mengambil ID dari body

  try {
    const user = await collection.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send();
    }
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(user);
    } else {
      return res.redirect("/user");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Pastikan ID valid sebagai ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // Hapus user berdasarkan ID
    const user = await collection.deleteOne({ _id: id });

    if (!user) {
      return res.status(404).json({ error: id });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/company/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Pastikan ID valid sebagai ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid company ID format" });
    }

    // Hapus user berdasarkan ID
    const dc = await company.deleteOne({ _id: id });

    if (!dc) {
      return res.status(404).json({ error: id });
    }
    res.status(200).json(dc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/company", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/listcompany");
    const data = await response.json();
    const responseType = await fetch("http://localhost:3000/listtype");
    const dataType = await responseType.json();
    res.render("company", { data, dataType });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan saat mengambil data.");
  }
});

app.post("/editcompany", async (req, res) => {
  const id = req.body.id;

  try {
    const company = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).send();
    }
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(company);
    } else {
      return res.redirect("/company");
    }
    // res.status(200).json(company);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/getcompany", async (req, res) => {
  const { id } = req.body;
  try {
    const company = await Company.findById(id);
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/listuser", async (req, res) => {
  try {
    const users = await collection.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/addtype", async (req, res) => {
  try {
    const tipe = new Type(req.body);
    await tipe.save();
    res.status(201).send(tipe);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/gettype", async (req, res) => {
  const { id } = req.body;
  try {
    const type = await Type.findById(id);
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/listtype", async (req, res) => {
  try {
    const type = await Type.find();
    res.status(200).send(type);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/company/addcompany", async (req, res) => {
  console.log(req.body);
  const data = {
    name: req.body.name,
    store_name: req.body.store_name,
    address: req.body.address,
    id_type: req.body.id_type,
    status: req.body.status,
    phone: req.body.phone,
    email: req.body.email,
  };

  try {
    const company = new Company(data);
    await company.save();
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(company);
    } else {
      return res.redirect("/company");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/listcompany", async (req, res) => {
  try {
    const company = await Company.find();
    res.status(200).send(company);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/store", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/liststore");
    const data = await response.json();
    const responseCompany = await fetch("http://localhost:3000/listcompany");
    const dataCompany = await responseCompany.json();
    res.render("store", { data , dataCompany });
  } catch (error) {
    res.status(500).send("Terjadi kesalahan saat mengambil data.");
  }
});
app.post("/store/addstore", async (req, res) => {
  console.log(req.body);
  const data = {
    name: req.body.name,
    address: req.body.address,
    status: req.body.status,
    id_company: req.body.id_company,
  };

  try {
    const store = new Store(data);
    await store.save();
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(store);
    } else {
      return res.redirect("/store");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/liststore", async (req, res) => {
  try {
    const store = await Store.find();
    res.status(200).send(store);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/editstore", async (req, res) => {
  const id = req.body.id;

  try {
    const store = await Store.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!store) {
      return res.status(404).send();
    }
    if (req.is("json") || req.get("Accept") === "application/json") {
      return res.json(store);
    } else {
      return res.redirect("/store");
    }
    // res.status(200).json(company);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/api/store/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Pastikan ID valid sebagai ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid store ID format" });
    }

    // Hapus user berdasarkan ID
    const ds = await Store.deleteOne({ _id: id });

    if (!ds) {
      return res.status(404).json({ error: id });
    }
    res.status(200).json(ds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/getstore", async (req, res) => {
  const { id } = req.body;
  try {
    const store = await Store.findById(id);
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.post("/addtype", async (req, res) => {
//     const ukuran = await collection.findOne({ username: req.body.username });
//   try {
//     const users = await collection.find();
//     res.status(200).send(users);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// Define Port for Application
app.listen(PORT, () => {
  console.log(`Server listening on PORT`);
  console.log(`http//localhost:${PORT}`);
});
