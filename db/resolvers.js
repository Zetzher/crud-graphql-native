const Usuario = require("../models/Usuario");
const Proyecto = require("../models/Proyecto");
const Tarea = require("../models/Tarea");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

//Crea y firma un JWT
const crearToken = (usuario, secret, expiresIn) => {
  const { id, email } = usuario;

  return jwt.sign({ id, email }, secret, { expiresIn });
};

const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.id });

      return proyectos;
    },
    obtenerTareas: async (_, {input}, ctx) => {
      const tareas = await Tarea.find({ creador: ctx.id })
        .where("proyecto")
        .equals(input.proyecto);
      return tareas;
    },
  },

  Mutation: {
    crearUsuario: async (_, { input }) => {
      const { email, password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      if (existeUsuario) {
        throw new Error("El usuario ya ha sido registrado");
      }

      try {
        // Hashear password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        console.log(input);

        // Registrar nuevo usuario
        const nuevoUsuario = new Usuario(input);

        Usuario.create(nuevoUsuario);

        return "Usuario Creado Correctamente";
      } catch (err) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      //Si usuario existe
      const existeUsuario = await Usuario.findOne({ email });

      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      //Si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("Password incorrecto");
      }

      //Dar acceso
      return {
        token: crearToken(existeUsuario, process.env.SECRET, "2hr"),
      };
    },
    nuevoProyecto: async (_, { input }, ctx) => {
      try {
        const proyecto = new Proyecto(input);
        proyecto.creador = ctx.id;
        const resultado = await proyecto.save();
        return resultado;
      } catch (err) {
        console.log(err);
      }
    },
    actualizarProyecto: async (_, { id, input }, ctx) => {
      let proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      if (proyecto.creador.toString() !== ctx.id) {
        throw new Error("Credenciales incorrectas");
      }

      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return proyecto;
    },
    eliminarProyecto: async (_, { id }, ctx) => {
      const proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      if (proyecto.id.toString() !== ctx.id) {
        throw new Error("Credenciales incorrectas");
      }

      await Proyecto.findOneAndDelete({ _id: id });

      return "Proyecto Eliminado";
    },

    nuevaTarea: async (_, { input }, ctx) => {
      try {
        let tarea = new Tarea(input);
        tarea.creador = ctx.id;
        console.log(tarea, "yeyyyyy");
        const resultado = await Tarea.create(tarea);
        return resultado;
      } catch (err) {
        console.log(err);
      }
    },
    actualizarTarea: async (_, { id, input, estado }, ctx) => {
      let tarea = await Tarea.findById(id);
      console.log(ctx, "tarea");
      if (!tarea) {
        throw new Error("Tarea no encontrado");
      }

      if (tarea.creador.toString() !== ctx.id) {
        throw new Error("Credenciales incorrectas");
      }

      input.estado = estado;

      tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true });

      return tarea;
    },
    eliminarTarea: async (_, { id }, ctx) => {
        const tarea = await Tarea.findById(id);
  
        if (!tarea) {
            throw new Error("Tarea no encontrado");
          }
    
          if (tarea.creador.toString() !== ctx.id) {
            throw new Error("Credenciales incorrectas");
          }
  
        await Tarea.findOneAndDelete({ _id: id });
  
        return "Proyecto Eliminado";
      },
  },
};

module.exports = resolvers;
