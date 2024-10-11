function validateClassificationForm(){
    const classificationName = document.getElementById("classificationName").ariaValueMax;
    const regex = /^[^\s`~!@#$%^&*()_+\-={}|[\]\\:";'<>?,.\/]+$/;

    if (!regex.test(classificationName)){
        alert("Classification name cannot contain space or special characters.");
        return false;
    }
    return true;
}

function validateInventoryForm(){
    const make = document.getElementById("inv_make").value;
    const model = document.getElementById("inv_model").value;
    const year = document.getElementById("inv_year").value;

    if (!make || !model || !year){
        alert("Please fill out all required fields.");
        return false;
    }
    return true;
}
