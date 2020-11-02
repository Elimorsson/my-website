const saySomthing = (req, res, next) => {
    res.status(200).json({
        body: `Hello from the server!`
    });
};


module.exports.saySomthing = saySomthing;