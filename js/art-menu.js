//$(document).on('click','.art-tool', function() {
    //console.log($(this).id);
//});
$(function () {
    $(".art-tool").click(function (e) {
        var selectedTool = e.target.id;
        updateTool(selectedTool);
    });
});
console.log("HELLO!");
