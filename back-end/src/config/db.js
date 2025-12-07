const mongoose = require("mongoose");

async function connect() {
  try {
    const uri =
      "mongodb+srv://duytinnguyen77_db_user:ebuKZ0l6pG5ieRHF@cluster0.rrz5zhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    //mongodb+srv://duytinnguyen77_db_user:ebuKZ0l6pG5ieRHF@cluster0.rrz5zhu.mongodb.net/?appName=Cluster0

    await mongoose.connect(uri);
    console.log("Connected to DB Successfully!");
  } catch (err) {
    console.log("Connected to DB Failure!");
    console.log(err);
  }
}

module.exports = connect;
