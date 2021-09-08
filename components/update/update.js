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

  //[PUT] Atualiza personagem já existente

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res.status(400);
      send({
        error:
          "Requisição inválida, certifique-se que tenha os campos nome e imagemUrl",
      });
      return;
    }

    const quantidadePersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });

    if (quantidadePersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }

    const result = await personagens.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: objeto,
      }
    );
    //console.log(result);
    //Se acontecer algum erro no MongoDb, cai na seguinte valiadação
    if (result.acknowledged == "undefined") {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar o personagem" });
      return;
    }
    res.send(await getPersonagemById(id));
  });
})();

module.exports = router;
