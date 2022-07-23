
function init2(){
  d3.json("./static/data/table_data.json").then((incomingdata) => {
      var data = incomingdata;
      // console.log(data)
      var selTarget = d3.select('#selTarget');
      var selGene = d3.select('#selGene');
      var selCompartment = d3.select('#selCompartment');
      

      var targets=[];
      var genes=[];
      var compartments=[];

      var listlength = data.length;
      for (var i =0; i<listlength; i++){
        targets.push(data[i].Target)
        genes.push(data[i]['Gene Name'])
        compartments.push(data[i].Compartment)
      };

      distinctTargets = [...new Set(targets)].sort();
      distinctGenes = [...new Set(genes)].sort();
      distinctCompartments = [... new Set(compartments)].sort();

      var availableTags = distinctTargets.concat(distinctGenes).concat(distinctCompartments)
      
      distinctTargets.unshift('Featured');
      distinctGenes.unshift('Featured');
      distinctCompartments.unshift('Featured');


      distinctTargets.forEach(elem => {
        var dropDown1 = selTarget.append('option');
        dropDown1.attr("value", elem);
        dropDown1.text(elem);
      });

      distinctGenes.forEach(elem => {
        var dropDown2 = selGene.append('option');
        dropDown2.attr("value", elem);
        dropDown2.text(elem);
      });

      distinctCompartments.forEach(elem => {
        var dropDown3 = selCompartment.append('option');
        dropDown3.attr("value", elem);
        dropDown3.text(elem);
      });
     
      var targetList = ["B-RAF", "C-RAF", "CD8", "p53", "p16"];
     
      var data2 = data.filter(i => targetList.includes(i.Target))
     
      generateTable(data2)

      d3.select(".count-msg").text(`Showing ${data2.length} of ${listlength} Targets`);

      function split( val ) {
        return val.split( /,\s*/ );
      }

      function extractLast( term ) {
        return split( term ).pop();
      }

    
      $( "#tags" )
        // don't navigate away from the field on tab when selecting an item
        .on( "keydown", function( event ) {
          if ( event.keyCode === $.ui.keyCode.TAB &&
              $( this ).autocomplete( "instance" ).menu.active ) {
            event.preventDefault();
          }
        })
        .autocomplete({
          minLength: 0,
          source: function( request, response ) {
            // delegate back to autocomplete, but extract the last term
            response( $.ui.autocomplete.filter(
              availableTags, extractLast( request.term ) ) );
          },
          focus: function() {
            // prevent value inserted on focus
            return false;
          },
          select: function( event, ui ) {
            var terms = split( this.value );
            // remove the current input
            terms.pop();
            // add the selected item
            terms.push( ui.item.value );
            // add placeholder to get the comma-and-space at the end
            terms.push( "" );
            this.value = terms.join( "" );
            return false;
          }
        });

  })
}

init2();

function generateTable(tableData){
  //Separate data into table format
  var tableContent=[];
  for (i=0; i< tableData.length; i++) {
      tableContent += `<tr><td> ${tableData[i].Target}</td><td>${tableData[i]['Gene Name']}</td><td>${tableData[i]['Uniprot href']}</td><td>${tableData[i].Compartment}</td></tr>`;
  };
  //Select table div and insert table html
  var tableBody = d3.select("tbody");
  tableBody.html("");
  tableBody.html(tableContent);
};

function optionChanged2(){
  var targetFilter = d3.select("#selTarget").property("value");
  var geneFilter = d3.select("#selGene").property("value");
  var compartmentFilter = d3.select("#selCompartment").property("value");
  var selInput = d3.select('#tags').property("value");
  console.log(selInput)

  d3.json("./static/data/table_data.json").then((incomingdata) => {
    var tableData = incomingdata;
    
    if (selInput){
      var tableData2 = tableData.filter(i => {return (i.Target === selInput) || (i['Gene Name'] === selInput) || (i.Compartment === selInput)});

    }
    else{
      var tableData2 = tableData.filter(i => {if (targetFilter && (targetFilter !== 'Featured')) {return i.Target === targetFilter;} else {return true;}})
      .filter(i => {if (geneFilter && (geneFilter !== 'Featured')){return i['Gene Name'] === geneFilter;} else {return true;}})
      .filter(i => {if (compartmentFilter && (compartmentFilter !== 'Featured')){return i.Compartment === compartmentFilter;} else {return true;}})
      
      var targetList = ["K-RAS", "ERK2", "ApoA-I", "ApoC-III", "AQP1"];
      if ((targetFilter === 'Featured') && ((geneFilter !== 'Featured') || (compartmentFilter !== 'Featured'))){
        tableData2 = tableData.filter(i => {if (geneFilter && (geneFilter !== 'Featured')){return i['Gene Name'] === geneFilter;} else {return true;}})
        .filter(i => {if (compartmentFilter && (compartmentFilter !== 'Featured')){return i.Compartment === compartmentFilter;} else {return true;}})
      } 
      if ((targetFilter === 'Featured') && (geneFilter === 'Featured') && (compartmentFilter === 'Featured')){
        tableData2 = tableData.filter(i => targetList.includes(i.Target))
      } 
    }
    console.log(tableData2)
    generateTable(tableData2);

    d3.select(".count-msg").text(`Showing ${tableData2.length} of ${tableData.length} Targets`);
})};


function init(){
    d3.json("./static/data/pub.json").then((incomingdata) => {
        var data = incomingdata;
        // console.log(data)

        var selList = d3.select('#selDataset');
        var listvals = data.name;
        for (var i =0; i<listvals.length; i++){
          var dropDown = selList.append('option');
          dropDown.attr("value", i);
          dropDown.text(listvals[i]);
        };

        bar_plot(data,0)
    })
}

init();

  
  //***************************************************************************************************/
   
  function optionChanged(){
    var inputValue = d3.select("#selDataset").node().value
    console.log(inputValue);
  
    d3.json("./static/data/pub.json").then((incomingdata) => {
      var data = incomingdata;
  
      var sidebarData = Object.entries(data.publications[inputValue]);
      // console.log(sidebarData);
  
   
    if (inputValue == 0){
      // Restyle/Relayout Horizontal Bar Graph
        bar_plot(data, 0)
    }
    else {
        bar_plot(data, inputValue)
    }
   });
  }

function bar_plot(data, index_num){
    // Add horizontal bar chart
    console.log(index_num)
    // let feature = {'targets': ['p21', 'p33', 'r12'], 'total_pubs':[550, 1290, 740]}
    if (index_num === 0){
        // console.log(data.publications[0].total_pubs)
        // console.log(data.publications[0].targets)

        var trace = {
        type: "bar",
        orientation: "h",
        x: data.publications[0].total_pubs,
        y: data.publications[0].targets,
        };

        var chartData = [trace];

        var layout = {
        title: `Featured Targets`,
        xaxis: {
        title: 'Total Publications',
        },
        yaxis: {
        title: 'Target'
        },
        };

        Plotly.newPlot("bar", chartData, layout);
    } //end if
    else {
        var trace = {
        type: "bar",
        orientation: "v",
        x: data.publications[index_num].years,
        y: data.publications[index_num].num_publications
        };

        var chartData = [trace];

        var layout = {
        title: `Target Popularity: ${data.publications[index_num].id}`,
        xaxis: {
        title: 'Year',
        },
        yaxis: {
        title: 'Number of Publications'
        },
        };

        var config = {responsive: true}

        Plotly.newPlot("bar", chartData, layout, config);
    } //end else


}


  


