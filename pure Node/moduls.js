module.exports  =(temp,product)=>{
    let output= temp.replace(/{%Product_name%}/g, product.productName)
    output = output.replace(/{%image%}/g, product.image)
    output = output.replace(/{%price%}/g, product.price)
    output = output.replace(/{%nutrients%}/g, product.nutrients)
    output = output.replace(/{%quantity%}/g, product.quantity)
    output = output.replace(/{%ID%}/g, product.id)
    output = output.replace(/{%description%}/g, product.description)
    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g,'not-organic')
    return output
}
