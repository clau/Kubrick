Kubrick
===========

Kubrick is a MooTools plug-in that can add one or more color picker widgets into a page through JavaScript. Each widget is then linked to an existing element (e.g. a text field) and will update the element's value when a color is selected.

![Screenshot](http://github.com/clau/Kubrick/raw/master/kubrick.png)

How to use
----------

	#HTML
        ...
        <head>
          <title>...</title>
          <script type="text/javascript" src="path/to/mootools-1.2.4-core.js"></script>
          <script type="text/javascript" src="path/to/Kubrick.js"></script>
          <script>
            window.addEvent('domready', function() {
              var k = new Kubrick('colorInput', {
                onColorChange: function(new_color) {
                  console.log(new_color)
                }
              });
            });
          </script>
          <link rel="stylesheet" href="path/to/Kubrick.css" type="text/css" />
          ...
        </head>
        <body>
          ...
          <input type="text" id="colorInput" />
          ...
        </body>
        ...

Demos
----------

- You can see a simple online demo in [this blog post](http://tabqwerty.com/2010/07/01/colour-me-kubrick.html)

Support
-----------
Please contact me (clau@tabqwerty.com) if you have any suggestions or comments.