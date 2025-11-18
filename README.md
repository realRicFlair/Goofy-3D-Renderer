# Goofy 3D Renderer  

This was initially a simple assigbnment for CMPT-361 where we were instructed to efficiently draw lines and triangles given through the command window.  
I decided that was boring and being unemployed, I decided to abuse the assignment and make a full on software rasterizer, that given any 3d .obj file, will spit out the 2d draw commands (in our custom assignment format) and render it on the screen.  
Luckily since our assignment lets us specify the color of a vertex when we draw it, that means we can also do shading. It features lambertian shading with gourad to interpolate between the triangles. It ends up looking hilariously good.  

Initially the assignment program only renders once you copy paste the text and press update. I modified it slightly to update on every frame. I also increased the resolution.  
The most insightfull part of this assignment for me, was just how ridiculously fast modern CPU's have become.  
Something as ridiculous as running a full rasterizer, entirely on the CPU, thats running a VM that interprets javascript, that has to convert between two vertex formats in memmory (From array to the text file to pass to triangle drawer) for absolutely no reason, along with shading for every triangle.  
Despite all that, it somehow manages to run decently and with some fluidity. Its astonishing
