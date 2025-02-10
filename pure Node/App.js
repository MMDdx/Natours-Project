const fs = require('fs')
const http = require('http')
const url = require("url")
const slugify = require('slugify')

const replaceTemplate = require("./moduls")

let Json_readed  = fs.readFileSync(`${__dirname}/data.json`, 'utf-8')
let tempOverview =  fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8')
let tempcard =  fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8')
let tempProduct =  fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')
let json_obj= JSON.parse(Json_readed)

const slugs = json_obj.map(el=>slugify(el.productName, {lower: true}))
console.log(slugs)
const server = http.createServer((req, res) => {

    const {query, pathname} = url.parse(req.url, true)

    // Overview
    if (pathname === "/overview"){
        const cardHtml = json_obj.map((el)=>replaceTemplate(tempcard, el)).join("")
        const  output = tempOverview.replace("{%product_cards%}", cardHtml)

        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(output)
    }
    // product
    else if(pathname === "/product"){
        const real_query = {[Object.entries(query)[0][0]]:Object.entries(query)[0][1]}
        const product =  json_obj[real_query.id]
        res.writeHead(200, {'Content-Type': 'text/html'})
        const output= replaceTemplate(tempProduct, product)
        res.end(output)
    }
    // api
    else if(pathname === "/api"){
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(Json_readed)

    }
    // else
    else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my_own_header': "hello world"
        })
        res.end("<h1>salam</h1>")
    }
})

server.listen(8080, '127.0.0.1', () => {
    console.log('Listening on port 8080')
})
