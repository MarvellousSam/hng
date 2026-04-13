const express = require('express')
const app = express()
const cors = require('cors')


app.use(cors())
app.use(express.json())
app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}`)
    next()
})


app.get('/api/classify', async(req,res)=>{
    try {
        const {name} = req.query
        if(!name){
            return res.status(400).json({
                status: "error", 
                message: "Bad Request"})
        }

        if(typeof name!=="string" || name.trim()===""){
            return res.status(422).json({
                status: "error", 
                message: "Unprocessable Entity"})
        }

        const response = await fetch(`https://api.genderize.io/?name=${encodeURIComponent(name)}`)
        if(!response.ok){
            return res.status(502).json({
                status: "error", 
                message: "External API failed"})
        }
        const data = await response.json()
        const {gender, probability,count:sample_size} = data


        if(!gender || sample_size===0){
            return res.status(404).json({
                status:"error", 
                message: "No prediction available for the provided name"})
        }

        const isConfident = probability>=0.7 && sample_size>=100

        const processed_at = new Date().toISOString()
        return res.status(200).json({
            status: "success", 
            data:{name, gender, probability,sample_size, isConfident, processed_at}})
    } catch (error) {
        return res.status(500).json({status:"error", message: "Internal server error"})
    }
    
    

})

app.listen(5000, ()=>{
    console.log('Server is running')
})