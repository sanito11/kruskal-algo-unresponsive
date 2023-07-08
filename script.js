const canvas = document.querySelector('canvas')
const table = document.querySelector('table')
const srcInput = document.querySelector('#src')
const destInput = document.querySelector('#dest')
const weightInput = document.querySelector('#weight')
const edgeButtons = document.querySelectorAll('.edge-ctrl .buttons button')
const vertexInput = document.querySelector('#vertexInput')
const removeVerButton = document.querySelector('#removeVer')
const clearAllButton = document.querySelector('#clearAll')
const errorContainer = document.querySelector('.error-container')
const costText = document.querySelector('.cost')

const ctx = canvas.getContext('2d')

//default radius
const R = 20

//storage of vertices and edges
var vertices = []
var edges = []

canvas.addEventListener('click', storeVertex)

function storeVertex(e) {
    //prevents the vertex to go beyond the canvas and overlapping
    if (vertices.length === 26) return throwError('Limit reached!')
    if (e.clientX < R || e.clientX > 786 - R || e.clientY - 70 < R || e.clientY - 70 > 480 - R ||
        hasOverlap(e.clientX, e.clientY - 70)) return throwError('Invalid position!')
    //stores the object of the data in the storage
    vertices.push({
        label: setLetter(),
        x: e.clientX,
        y: e.clientY - 70,
        weight: []
    })

    updateCanvas()

}

function storeEdge() {

    //sort the src and dest (example: src=B, dest=A; the src will become A and dest is B)
    var a = sortSource(srcInput, destInput),
        b = sortSource(srcInput, destInput, false),
        aObject = vertices[findVertexObject(a.value)],
        bObject = vertices[findVertexObject(b.value)],
        src = a.value,
        dest = b.value,
        weight = weightInput.value

    edgeCtrlReset()
    if (aObject === undefined || bObject === undefined) return throwError("Vertices doesn't exist in the canvas")

    //overwrites edge if inputs duplicate edge
    overwriteEdge(src, dest)

    //stores the edge object into the edges storage
    edges.push({
        src: src,
        dest: dest,
        x1: aObject.x,
        y1: aObject.y,
        x2: bObject.x,
        y2: bObject.y,
        weight: Number(weight)
    })

    //sorts the edge according to its weight
    sortEdge()
    updateCanvas()
}


function inputCheck(input) {
    //checks the all input if filled then toggle off disabled button
    const activeEle = document.activeElement

    input.value = input.value.toUpperCase()

    //limits the input for 1 character only    
    if (input.value.length > 1) {
        input.value = input.value[0]
    }
    //only letter input
    if (!/[A-Z]/.test(input.value)) {
        input.value = ''
    }
    //prevents to input the same vertex for src and dest
    if (srcInput.value == destInput.value) {
        activeEle.value = ''
    }

    checkInputValues()

}

function vertexCheck(input) {
    //toggle vertex button checker
    input.value = input.value.toUpperCase()


    if (input.value.length > 1) {
        input.value = input.value[0]
    }
    if (!/[A-Z]/.test(input.value)) {
        input.value = ''
    }

    input.value == '' ? removeVerButton.disabled = true : removeVerButton.disabled = false

}

function limitWeight(input) {
    //make a range for weight input from 0 to 999

    //defaults the weight by 1
    if (input.value <= 0) {
        input.value = ''
    }
    //limits the weight value to 999
    if (input.value >= 1000) {
        input.value = 999
    }

    checkInputValues()

}

function checkInputValues() {
    //toggles the add/remove edge button  on/off by checking the inputs if it's filled
    if (srcInput.value == '' || destInput.value == '' || weightInput.value == '') {
        return edgeButtons.forEach(btn => btn.disabled = true)
    }

    edgeButtons.forEach(btn => btn.disabled = false)

}

function edgeCtrlReset() {
    //removes edge inputs' value
    srcInput.value = ''
    destInput.value = ''
    weightInput.value = ''
    checkInputValues()

}

function hasOverlap(x, y) {
    //identifies if there are overlapping vertices
    for (let ver of vertices) {
        var distance = Math.sqrt((ver.x - x) ** 2 + (ver.y - y) ** 2)
        if (distance <= (R * 2)) return true
    }

    return false
}

function newVertex(x, y, r, text) {
    //plot the vertex in the canvas

    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)

    //vertex fill and border color 
    ctx.fillStyle = 'blue'
    ctx.fill()

    ctx.strokeStyle = 'white'
    ctx.stroke()

    //canvas text
    ctx.font = `${R * 0.75}px Arial`;
    ctx.fillStyle = 'white'
    ctx.fillText(text, x - (R * 0.25), y + (R * 0.25));

}

function removeVertex() {

    var temp = [], bugLetters = 'FGHIJKLMNOPQRSTUVWXYZ'
    var madeChanges = false

    //removes the vertex with the same label with the input
    for (let i in vertices) {
        if (vertices[i].label == vertexInput.value) {
            madeChanges = true
            vertices.splice(i, 1)
        }
    }

    //removes edges that are connected to the removed edge
    for (let i = 0; i < edges.length; i++) {
        if (!(edges[i].src == vertexInput.value) && !(edges[i].dest == vertexInput.value)) temp.push(edges[i])
    }

    //overwrites edges value into trimmed value
    edges = temp
    edgeCtrlReset()
    vertexInput.value = ''
    vertexCheck(vertexInput)

    //fixed the vertex stroke bug
    if (bugLetters.includes(vertexInput.value)) {
        setTimeout(updateCanvas, 50)
        setTimeout(updateCanvas, 100)
    }

    //throw error if no changes made
    if (!madeChanges) throwError("Vertex doesn't exist in the canvas")

    updateCanvas()

}

function overwriteEdge(src, dest) {
    //removes old edge if inputs with the same edge
    for (let i in edges) {
        if (edges[i].src == src && edges[i].dest == dest) {
            edges.splice(i, 1)
            updateCanvas()
        }
    }
}

function sortSource(a, b, isAscending = true) {

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    //sorts the src and dest alphabetically
    if (isAscending) {
        if (alphabet.indexOf(a?.value) < alphabet.indexOf(b?.value)) return a
        return b
    }
    else {
        if (alphabet.indexOf(a?.value) > alphabet.indexOf(b?.value)) return a
        return b
    }

}

function findVertexObject(label) {

    //finds the vertex object in the vertices storage
    for (let i in vertices) {
        if (vertices[i]?.label == label) return i
    }

}

function newEdge(x1, y1, x2, y2, weight, isHighlight = false) {
    //plots new edge

    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = isHighlight ? 'white`' : 'orangered'
    ctx.lineWidth = 2
    ctx.stroke()

    //edge weight text
    ctx.font = `bold ${R * 0.60}px Arial`;
    ctx.fillStyle = isHighlight ? 'yellow' : 'white'
    ctx.fillText(weight, (x1 + x2) / 2, (y1 + y2 + 20) / 2);

}

function removeEdge() {

    var src = srcInput.value, dest = destInput.value, weight = Number(weightInput.value)
    var madeChanges = false

    //finds the edge with the same data to the inputted data
    for (let i in edges) {
        if (src == edges[i].src && dest == edges[i].dest && weight === edges[i].weight) {
            edges.splice(i, 1)
            edgeCtrlReset()
            madeChanges = true
        }
    }

    //throws an error if no changes made
    if (!madeChanges) throwError('Canvas contains no edge with that attribute')

    sortEdge()
    updateCanvas()

}

function clearCanvas() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

}

function updateCanvas() {

    clearCanvas()
    updateTable()
    clearAllToggle()
    removeCost()

    //plot the vertices and edges in the canvas
    edges.forEach(edge => newEdge(edge.x1, edge.y1, edge.x2, edge.y2, edge.weight))
    vertices.forEach(ver => newVertex(ver.x, ver.y, R, ver.label))

}

function setLetter() {
    //set vertex label alphabetically
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var takenLetters = vertices.map(ver => { return ver.label })

    for (let i in alphabet) {
        if (!takenLetters?.includes(alphabet[i])) return alphabet[i]
    }

}

function updateTable() {

    //default table header
    table.innerHTML =
        `
        <tr>
            <th>Src</th>
            <th>Dest</th>
            <th>Weight</th>
        </tr>
    `

    //append the edges' data to the table
    for (let i in edges) {
        table.innerHTML +=
            `
            <tr>
                <td>${edges[i]?.src}</td>
                <td>${edges[i]?.dest}</td>
                <td>${edges[i].weight}</td>
            </tr>
        `
    }
}

function sortEdge() {

    var temp

    //sorts the edge according to its weight
    for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
            if (edges[i].weight > edges[j].weight) {
                temp = edges[j]
                edges[j] = edges[i]
                edges[i] = temp
            }
        }
    }

}

function clearAll() {

    //clear the canvas and the storages
    vertices = []
    edges = []
    updateCanvas()

}

function clearAllToggle() {

    //toggles the clear all button
    clearAllButton.disabled = vertices.length === 0 ? true : false

}

function findMST() {

    //throws an error if edges and vertices container length = 0
    if (edges.length === 0 || vertices.length === 0) return throwError('Canvas contains no vertex/edge')
    if (hasUnconnectedVertex()) return throwError('Graph contains unconnected vertices')

    //gather the different edges' data to its specific storage
    let edgeSources = edges.map(edge => { return edge.src })
    let edgeDestinations = edges.map(edge => { return edge.dest })
    let edgeWeights = edges.map(edge => { return edge.weight })

    //runs the Kruskal's Algorithm
    kruskal(vertices.length, edges.length, edgeSources, edgeDestinations, edgeWeights)


}

function hasUnconnectedVertex() {
    //checks if there's an unconnected vertex

    let vers = vertices.map(ver => { return ver.label })
    let edgeSrcs = edges?.map(edge => { return edge.src })
    let edgeDests = edges?.map(edge => { return edge.dest })

    for (let i in vers) {
        if (!edgeSrcs?.includes(vers[i]) && !edgeDests?.includes(vers[i])) return true
    }

    return false

}

//edge object for graph
class Edge {
    constructor(v1, v2, w = 0) {
        this.v1 = v1;
        this.v2 = v2;
        this.w = w;
    }
}

//graph object for kruskal
class Graph {
    constructor(v, e) {
        this.v = v;
        this.e = e;
        this.edges = [];
        this.nodes = [];
    }

    addEdge(edge) {
        this.edges.push(edge);
        if (!this.nodes.includes(edge.v1)) {
            this.nodes.push(edge.v1);
        }
        if (!this.nodes.includes(edge.v2)) {
            this.nodes.push(edge.v2);
        }
    }

    getEdge(pos) {
        return this.edges[pos]
    }

    getEdges() {
        return this.edges
    }

    getNodes() {
        return this.nodes
    }

    // get the parent/root of node
    find(subsets, node) {
        let nodeInfo = subsets.get(node);
        if (nodeInfo.parent != node) {
            nodeInfo.parent = this.find(subsets, nodeInfo.parent)
        }

        return nodeInfo.parent;
    }

    // unite the x and y subsets based on rank
    union(subsets, x, y) {
        let xroot = this.find(subsets, x);
        let yroot = this.find(subsets, y);

        if (subsets.get(xroot).rank < subsets.get(yroot).rank) {
            subsets.get(xroot).parent = yroot;
        } else if (subsets.get(xroot).rank > subsets.get(yroot).rank) {
            subsets.get(yroot).parent = xroot;
        } else {
            subsets.get(yroot).parent = xroot;
            subsets.get(xroot).rank++;
        }
    }
}


function kruskal(gNodes, gEdges, gFrom, gTo, gWeight) {
    let i = 0, j = 0, cost = 0;
    let subsets = new Map()
    let includedEdge = []

    let graph = new Graph(gNodes, gEdges);

    //create and store the edge in the graph
    while (i < gEdges) {
        graph.addEdge(new Edge(gFrom[i], gTo[i], gWeight[i]));
        i++;
    }

    //stores all vertices in the subsets map
    graph.getNodes().forEach(node => {
        subsets.set(node, { parent: node, rank: 0 });
    });

    i = 0;

    //get N = (V-1) of edges in the graph
    while (j < gNodes - 1) {
        let edge = graph.getEdge(i++);
        let root1 = graph.find(subsets, edge.v1);
        let root2 = graph.find(subsets, edge.v2);

        // if the nodes doesn't create a cycle then we add the edge to final subgraph
        if (root1 != root2) {

            //stores all non-cycle edges
            includedEdge.push(graph.getEdges().indexOf(edge))
            // update the total weight of the subgraph
            cost += edge.w;
            graph.union(subsets, root1, root2);
            j++
        }
    }

    //highlights the path and shows MST cost
    highlightPath(includedEdge)
    costText.innerText = `MST Cost: ${cost}`

}

function throwError(err) {

    //creates error modal element
    const errorModal = document.createElement('div')
    const header = document.createElement('h5')
    const p = document.createElement('p')

    header.innerText = 'ERROR'
    p.innerText = err
    errorModal.appendChild(header)
    errorModal.appendChild(p)

    errorModal.classList.add('error-modal')
    errorContainer.appendChild(errorModal)

    setTimeout(() => {
        var arr = document.querySelectorAll('.error-modal')
        arr.forEach(err => {
            err.style.display = 'none'
        })
    }, 2000)
}

function highlightPath(includedEdgeIndex) {
    var nonpathEdges = [], pathEdges = []

    clearCanvas()

    updateTable()
    clearAllToggle()

    //identifies the path and nonpath edges
    for (let i = 0; i < edges.length; i++) {
        if (!includedEdgeIndex.includes(i)) {
            nonpathEdges.push(edges[i])
        } else {
            pathEdges.push(edges[i])
        }
    }


    //plot the path edges
    pathEdges.forEach(edge => newEdge(edge.x1, edge.y1, edge.x2, edge.y2, edge.weight, true))
    setTimeout(() => {
        vertices.forEach(ver => newVertex(ver.x, ver.y, R, ver.label))
    }, 10)
}

function removeCost() {
    costText.innerText = `MST Cost:`
}
