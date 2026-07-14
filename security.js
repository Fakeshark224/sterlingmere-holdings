// security.js - Sterlingmere Holdings Security Measures
// Prevents right-click, inspecting elements, viewing source, and copying text to deter code and image theft.

(function() {
    // 1. Disable Right Click (Context Menu)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Disable Keyboard Shortcuts for Developer Tools (F12, Ctrl+Shift+I, etc.)
    document.onkeydown = function(e) {
        // F12 key
        if (e.keyCode == 123) {
            return false;
        }
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
            return false;
        }
        // Mac Shortcuts (Cmd+Option+I, Cmd+Option+C, Cmd+Option+J, Cmd+Option+U)
        if (e.metaKey && e.altKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0) || e.keyCode == 'U'.charCodeAt(0))) {
            return false;
        }
    };

    // 3. Disable Text Selection (Optional but good for preventing text copying)
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });

    // 4. Disable Dragging of Images
    document.addEventListener('dragstart', function(e) {
        if (e.target.nodeName.toUpperCase() === 'IMG') {
            e.preventDefault();
        }
    });
})();
