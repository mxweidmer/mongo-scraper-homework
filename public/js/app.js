

$(function () {

    $(".comment").on("click", function () {
        var comment = {
            body: $("#comment-field").val().trim()
        }

        $.ajax("/article/" + $("h3").attr("id"), {
            type: "POST",
            data: comment
        }).then(
            function () {
                console.log("Added comment");
                location.reload();
            }
        );
    })

    $(".delete").on("click", function () {

        $.ajax("/comment/" + $(".delete").attr("id"), {
            type: "PUT"
        }).then(
            function () {
                console.log("Deleted comment");
                location.reload();
            }
        );
    })
});
