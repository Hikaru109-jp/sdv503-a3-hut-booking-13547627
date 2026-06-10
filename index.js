import readline from "readline";
import fs from "fs";   //This is necessary for importing and exporting to data.json

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//This function is for displaying a question from readline and waiting until user enters.
function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
}


async function mainMenu() {
    while(true){
        const menu = await ask ("Enter Command: [RegisterHut, Book, List, Summary, Cancel, Exit]: ");
            if(menu === "RegisterHut"){
               await registerHut();
            } else if(menu === "Book"){
                await bookingHut();
            } else if(menu === "List"){
                await listBookings();
            } else if(menu === "Summary"){
                await summaryHut();
            } else if(menu === "Cancel"){
                await cancelHut();
            } else if(menu === "Exit"){
                await exitWork();
            } else {
                console.log("the command doesn’t exist");
            }
        }
}

mainMenu()


//This code is for loading the data from data.json
const loadData = () => {
    try {
        return JSON.parse(fs.readFileSync("data.json", "utf8"));
    } catch(err) {
        console.log("Data file not found or corrupt. Starting with empty data.");
        return { huts: [], bookings: [] }
    }
}

//This code if for saving the data into data.json
const saveData = (data) => {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}


//This function is for registering a hut.
async function registerHut() {
    const name = await ask ("Name: ");
        if(name === ""){
            console.log("Name can not be empty");
            return;
        }
    const location = await ask ("Location: ");
        if(location === ""){
            console.log("Location can not be empty");
            return;
        }
    const walk = await ask ("Walk: ");
        if(walk === ""){
            console.log("Walk can not be empty");
            return;
        }
    const capacity = await ask ("Capacity: ");
    const capacityNum = Number(capacity); //ask method always return a string, so it is necessary to convert string to number.
        if(isNaN(capacityNum) || capacityNum <= 0){
            console.log("Capacity must be a positive number.");
            return;
        }

    const data = loadData(); //need to load data.json for maintaining existing data. *if you don't load the json file, your new data will over write to the existing data.

    const newHut = {
    id: data.huts.length + 1,
    name: name,
    location: location,
    walk: walk,
    capacity: capacityNum
    };

    data.huts.push(newHut); //push method is for adding new elements into the array
    saveData(data);
    console.log("Your hut is successfully registered!");
}
