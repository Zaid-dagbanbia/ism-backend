const uniqueName = function() {
    const now = Date.now();
    return '' + ( parseFloat(now) * Math.ceil(Math.random() * 19));
}

export default uniqueName;