function GilaConnector(){

}

GilaConnector.prototype = {
  prepareDrag: function(opts){
    if(!opts.event) throw 'Event not specified';
    if(!opts.title) throw 'Note title not specified';
    if(!opts.content) throw 'Note content not specified';
    if(!opts.source) throw 'Note source not specified';

    var clipboard = opts.event.dataTransfer;

    if(!clipboard) throw 'Drag & drop not supported';

    var noteDataString = this._getDraggableString(opts);
    console.log(noteDataString);

    clipboard.setData('text', noteDataString);
  },
  _getDraggableString: function(opts){
    var sourceString = JSON.stringify(opts.source),
      noteHtml = '<div data-src='+sourceString+'>'+opts.content+'</div>';

    return noteHtml;
/*
    //New Method
    var noteData = {
      "title": opts.title,
      "content": opts.content,
      "source": opts.source
    };

    return JSON.stringify(noteData);
*/
  }
};