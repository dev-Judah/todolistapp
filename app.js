
const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongodb = require("mongodb")

const app = express();
const port = process.env.PORT || 3000;

// var items = ["get food","cook food","eat food"]
// let workItems = []
// let houseItem = []

//initialize body-parser
app.use(bodyParser.urlencoded({extended: true}))

// use css and other public files
app.use(express.static("public"));
//intialize the ejs template
app.set('view engine', 'ejs');

url = "mongodb://Judah:Judah123@ac-fohhf03-shard-00-00.skzkfo0.mongodb.net:27017,ac-fohhf03-shard-00-01.skzkfo0.mongodb.net:27017,ac-fohhf03-shard-00-02.skzkfo0.mongodb.net:27017/Test?ssl=true&replicaSet=atlas-stj0d3-shard-0&authSource=admin&retryWrites=true&w=majority"
url2 =  'mongodb://127.0.0.1:27017/todoDB'

// intialize mongodb
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(url, {useNewUrlParser: true});
}

// create schema for db
const itemSchema = new mongoose.Schema( {
    name: {type: String, required: [true, "an item is required"]}
});

// create model like sub db usning schema
const Item = mongoose.model("Item", itemSchema);

// create and insert data to model sub db 
const item1 = new Item ({
    name:"Buy groceries"
})
const item2 = new Item({
    name : "Wash car"
})
const item3 = new Item({
     name :"Clean kitchen"  
})
const defaultItem = [item1,item2,item3]
// Insert item created above to Item(model)
// Item.insertMany([item1,item2,item3])

// read items from db
// Item.find({}).then((item) =>{
//     item.forEach(function(ite){
//         console.log(ite.name)
//     })
// })
//or 
// const itemArray = Item.find({})
// itemArray.then((items)=>{
//     console.log(items)
// })

///////////////////////////////////////
//custom list schema documents
////////////////////////////////////////
const ListSchema=new mongoose.Schema ({
    name: {type:String, required:[true]},
    items: [itemSchema ]
})
 
// list model from our list schema 
const List =  mongoose.model("List", ListSchema)
///////////////////////////////////////////////////



//
app.get("/",(req,res)=>{  

    let day = date.getDate ();
    const itemArray = Item.find({})
itemArray.then((items)=>{
    if(items.length === 0){
        // insert default items to database
       Item.insertMany([item1,item2,item3]);
       res.redirect("/")
    }else{
        res.render('list', {listTitle: "Today", listItems:items});
    }
    
})

      
})

app.post("/",(req,res)=>{
    const itemName = req.body.listInput
    const listName = req.body.list

    const newItem = new Item({
        name :itemName
    });

    if(listName === "Today"){
        newItem.save();

        res.redirect("/")
    
    } else{
        List.findOne({name:listName}).then((resultList)=>{
            resultList.items.push(newItem)
            resultList.save()
            res.redirect("/" + listName)
        })
    }

   

    // if(req.body.listType === "Work-List"){
    //     workItems.push(item);
    //     res.redirect("/work")
    // }else if(req.body.listType === "House-list"){
    //     houseItem.push(item)
    //     res.redirect("/house")
    // }else{
    //     items.push(item)
    //     res.redirect("/")
    // }
   
    console.log(req.body)
})

app.post("/delete", (req,res)=>{
    const deletedItem = req.body.checkbox
    const listName = req.body.listName


    if(listName === "Today"){
        
    Item.findByIdAndRemove(deletedItem).exec();

    res.redirect("/")
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items: {_id:deletedItem}}}).exec()
        res.redirect("/" + listName)
    }

})

// const list = new List({
//     name:"work",
//     items: defaultItem
// })

// List.findOne({name: "test1"}).then((result)=>{
//     console.log(result)
// })

app.get("/:listName", (req,res)=>{
    let day = date.getDate ();
    const customList = _.capitalize(req.params.listName);
  
    
    List.findOne({name:customList})
    .then((resultList)=> {
        if(!resultList){
            //creata a new list sinced list is not found
            const list = new List({
                name: customList,
                items : defaultItem
            })
            list.save();
            // console.log("does not exist")
            res.redirect("/" + customList)
        }else{ 
            //show existing list
            res.render("list", {listTitle: resultList.name, listItems:resultList.items})

            // console.log(resultList.items)
            // console.log(`${customList} exists`)
        }
    })


   
})




app.listen(port,()=>{
    console.log("server is running on port 3000!")
})

/*
   var currentDay = today.getDay(); 
    var weekDay = ["sunday","monday", "tuesday","wednesday","thursday","friday","saturday"]
    var kindOfDay = ""
    console.log(currentDay)
    if(currentDay === 0 || currentDay === 6){
        kindOfDay = weekDay[currentDay]
    } else{
        kindOfDay = weekDay[currentDay]
    }

    */