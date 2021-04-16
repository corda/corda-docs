var anchorForId = function (id) {
    var anchor = document.createElement("a");
    anchor.className = "header-link";
    anchor.href = "#" + id;
    anchor.innerHTML = ' <img src="/images/svg/link.svg" alt="#" title="#" />';
    return anchor;
};

var linkifyAnchors = function (level, containingElement) {
    var headers = containingElement.getElementsByTagName("h" + level);
    for (var h = 0; h < headers.length; h++) {
        var header = headers[h];

        if (typeof header.id !== "undefined" && header.id !== "") {
            header.appendChild(anchorForId(header.id));
        }
    }
};

/**  This applies anchors to all content headings.  */
export function applyAnchors() {
    document.onreadystatechange = function () {
        if (this.readyState === "complete") {
            var contentBlock = document.getElementsByClassName("r3-content")[0];
            if (!contentBlock) {
                return;
            }
            for (var level = 2; level <= 4; level++) {
                linkifyAnchors(level, contentBlock);
            }
        }
    };
}
