var dataset;

var tree = d3.layout.tree(),
    nodes,
    links;

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
 //reversed coordinates to make a horizontal tree

d3.xml("http://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg", 
//d3.xml("ana.xml",
       function(error, data) {

    if (error) { return console.warn(error); }

   //console.log(data);

  dataset = xmlToJSON2(data); 

  //console.log(dataset);
  d3.select("div.fileContent").node()
          .appendChild(data.children[0]);
  
  var graphic = d3.select("div.fileContent > svg");
  if ((!graphic.attr("viewBox"))
        &&!!graphic.attr("width")
        &&!!graphic.attr("height")){
    
       graphic.attr("viewBox", "0 0 " +
                    graphic.attr("width") + " " +
                    graphic.attr("height"));
       graphic.attr("preserveAspectRatio", "xMidYMin meet");
  }
  
  drawTree(d3.select("div.treeLayout"), dataset);

}); //end of d3.xml()

//a recursive function to convert xml to JSON:
//attributes become properties;
//children are grouped in an array.
var nestByTagName = d3.nest().key(function(d){
        return d.tagName;
    });
function xmlToJSON2(xml) {
    var o = {"tagName": xml.tagName};
    if(xml.attributes) {
        o.attributes = [];
        Array.prototype.forEach.call(xml.attributes, 
              function(a){
                  o.attributes[a.name] = a.value;
              }); //treat the attributes node list as an array
                  //and add each attribute to the object
    }
    if (xml.textContent&&xml.textContent.length) {
        o["textContent"] = xml.textContent.trim();
    }
    if (xml.children.length) {        
        o.children = Array.prototype.map.call(xml.children,
                    function(child) {
                        return xmlToJSON2(child);
                    });
                //replace each xml object in the child array
                //with its JSON-ified version
    }
    
    return o;
}

function drawTree(selection, data) {
  
    var svg = selection.append("svg").append("g")
                .attr("transform", "translate(20,20)");
    var styles = window.getComputedStyle(selection.node());
    var height = parseInt(styles["height"]);
    var width = parseInt(styles["width"]);
  
  
    tree.size([height - 40, width - 100]);
  //reversed coordinates!
    nodes = tree.nodes(data);
    links = tree.links(nodes);
    
  
    var link = svg.selectAll("path.link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll("g.node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")"; 
      });
        //reversed coordinates!

  node.append("circle")
      .attr("r", 4.5);

  node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", function(d) { return d.children ? "0.5em" : 0; })
      .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.tagName; });
  
  var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style({position:"absolute",
                visibility:"hidden"});
  
  node.on("click", function(d) {

    var content ="";
    if (d.attributes){
      content +=
        d3.entries(d.attributes).map(function(o){
          return "<dt>"+o.key+":</dt><dd>" +
             o.value + "</dd>";
      } ).join(" ");
    }
    if (d.textContent) {
     content += "<dt>Text</dt><dd>"+
       d.textContent+"</dd>";
    }
    tooltip.html(content);
    
    var matrix = this.getScreenCTM(); 
            //reversed coordinates!
    //console.log(matrix);
    tooltip.style("visibility", "visible")
        .style("left", 
         Math.min((window.pageXOffset + matrix.e),
           (window.innerWidth -
             parseInt(
               window.getComputedStyle(tooltip.node())["width"]))
                 )+ "px")
        .style("top",
               (window.pageYOffset + matrix.f + 30) + "px");
    
  });
  
  tooltip.on("click", function(d) {
      d3.select(this).style("visibility", "hidden");
  });
}