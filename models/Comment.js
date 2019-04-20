var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    body: String
})

var Comment = mongoose.model("Comment", NoteSchema);

module.exports = Comment;