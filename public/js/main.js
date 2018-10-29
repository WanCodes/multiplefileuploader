$(document).ready(function () {
    $('#chooseFile').change(function () {
        updateFiles(this.files);
    });

    function updateFiles(files){
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
        validateFiles(files, fileSizeExceeded);
    }

    function validateFiles(files, fileSizeExceeded){
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

    $('#upload').click(function () {
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
                success: successHandler,
                error: function (res) {
                    console.log("ERROR: " + res);
                }
            });
        }
    });

    function successHandler(res){
        console.log(res.files);
        if(res.files.length > 0){
            $('#chooseFile').val("");
            updateFiles([]);
            validateFiles([], false);
            for(var i = 0; i < res.files.length; i++){
                var file = res.files[i];
                $('#dbList').append('<a href="/files/'+file.id+'" class="list-group-item list-group-item-action">'+file.id+' - '+file.name+'</a>');
            }
        }
    }
});