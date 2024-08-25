const respond = function(res, code , msg , data) {

    switch (code) {
        case 200:
            msg = msg ?? 'Success';
            break;
        case 201:
            msg = msg ?? 'Added!';
            break;
        case 400:
            msg = msg ?? 'Bad Request!';
            break;
        case 401:
            msg = msg ?? 'Unathorized!';
            break;
        case 404:
            msg = msg ?? 'Not Found!';
            break;
        case 500:
            msg = msg ?? 'Sever Error!';
            break;
        default:
            msg = msg ?? null;
            break;
    }

    const playload = {msg};
    if (data !== undefined) {
        playload.data = data;
    }

    return res.status(code).json(playload);
}

export default respond;