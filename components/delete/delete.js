const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbChar = process.env.DB_CHAR;
  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  const options = {
    useUnifiedTopology: true,
  };
  const client = await mongodb.MongoClient.connect(connectionString, options);

  const db = client.db("db_rickmorty");
  const personagens = db.collection("personagens");

  const getPersonagemById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

  //Middleware - especifica que é esse o import do router no index que queremos utilizar
  router.use(function timelog(req, res, next) {
    next();
    console.log("Time: ", Date.now());
  });

  //[GET] GetPersonagensById

  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    //Retorna a quantidade de personagens com o filtro(Id) especificado
    const quantidadePersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });
    //Checar se existe o personagem solicitado
    if (quantidadePersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }
    //Deletar personagem
    const result = await personagens.deleteOne({
      _id: ObjectId(id),
    });
    //Se não consegue deletar, erro do Mongo
    if (result.deletedCount !== 1) {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao remover o personagem" });
      return;
    }

    res.status(204).send({ info: "Personagem deletado com sucesso!" });
  });
})();

module.exports = router;
