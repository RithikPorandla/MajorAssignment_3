// List of countries for color coding
const countries = [
    'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China',
    'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Finland', 'France',
    'Gabon', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Italy', 'Japan', 'Kazakhstan', 'Lebanon', 'Netherlands', 'Norway', 'Pakistan',
    'Philippines', 'Poland', 'Polytechnic Univ', 'Portugal', 'Qatar', 'Romania', 'Russian Federation',
    'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
    'Taiwan', 'Thailand', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'United Kingdom', 'United States'
];

// Load JSON data asynchronously
d3.json("./data/publication_network.json").then(function (data) {
    // Create a color scale for countries without repetition
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

    // Set up the SVG container
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the force simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-1))
        .force("collide", d3.forceCollide(d => (d.num_citations / 1000) + 5).iterations(2))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = svg.selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", "black");

    // Create nodes
    const node = svg.selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", d => (d.num_citations / 1000) + 5)
        .attr("fill", d => colorScale(d.country));

    // Add pan and zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5]) // Zoom scale limits
        .on("zoom", zoomed);

    svg.call(zoom);

    // Update positions during simulation
    simulation.on("tick", updatePositions);

    // Function to handle zooming
    function zoomed() {
        svg.attr("transform", d3.event.transform);
    }

    // Function to update forces based on user input
    function updateForces() {
        const linkStrength = parseFloat(document.getElementById("linkStrength").value);
        const collideForce = parseFloat(document.getElementById("collideForce").value);
        const chargeForce = parseFloat(document.getElementById("chargeForce").value);

        // Update forces in the simulation
        simulation.force("link").strength(linkStrength);
        simulation.force("collide").strength(collideForce);
        simulation.force("charge").strength(chargeForce);

        // Restart the simulation
        simulation.alpha(1).restart();
    }

    // Event listener for form submission
    document.getElementById("applyChanges").addEventListener("click", updateForces);
});
