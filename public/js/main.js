$(document).ready(function () {
    new FileUploader();
});

function FileUploader(){
    var _this = this;
	this.init();
}

FileUploader.prototype = {
    init:function(){
		var _this = this;
	    this.setupListeners();
    },
    setupListeners:function(){
        var _this = this;
        $('#chooseFile').change(function () {
            _this.updateFiles(this.files);
        });
        $('#upload').click(function () {
            _this.submitFiles();
        });
    },
    submitFiles:function(){
        var _this = this;
        var filedata = document.getElementById("chooseFile");
        var formdata = false;

        if (window.FormData) {
            formdata = new FormData();
            formdata.enctype = "multipart/form-data";
        }

        for (var i = 0; i < filedata.files.length; i++) {
            var file = filedata.files[i];
            if (formdata) {
                formdata.append("name", file.name);
                formdata.append("file", file);
            }
        }
        if (formdata) {
            $.ajax({
                url: "http://localhost:8000/files",
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: function(res){
                    if(res.files.length > 0){
                        $('#chooseFile').val("");
                        _this.updateFiles([]);
                        _this.validateFiles([], false);
                        for(var i = 0; i < res.files.length; i++){
                            var file = res.files[i];
                            $('#dbList').append('<a href="/files/'+file.id+'" class="list-group-item list-group-item-action">'+file.id+' - '+file.name+'</a>');
                        }
                    }
                },
                error: function (res) {
                    console.log("ERROR: " + res);
                }
            });
        }
    },
    updateFiles:function(files){
        var _this = this;
        var flist = "";
        var fileSizeExceeded = false;
        for (var i = 0; i < files.length; i++) {
            var warningSize = "";
            if(files[i].size > 5242880){
                warningSize = " <span style='color:red'>Warning! file size is over 5MB</span>";
                fileSizeExceeded = true;
            }
            flist += '<li class="list-group-item">' + files[i].name + warningSize +'</li>'
        }
        $('#filesList').html(flist);
        _this.validateFiles(files, fileSizeExceeded);
    },
    validateFiles: function(files, fileSizeExceeded){
        //show submit button if there are files
        if (files.length > 0) {
            $('#upload').css("display", "inline-block");
        } else {
            $('#upload').css("display", "none");
        }
        //show warning message if more than 10 files
        if (files.length > 10) {
            $('#warningText').text("Warning! There are more than 10 files!")
        } else {
            $('#warningText').text("");
        }
        //disable submit button if file size exceeded or more than 10 files
        if(fileSizeExceeded || files.length > 10){
            $("#upload").prop('disabled', true);
        }else{
            $("#upload").prop('disabled', false);
        }
    }
}