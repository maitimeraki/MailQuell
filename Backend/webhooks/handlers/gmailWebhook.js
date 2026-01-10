const { gmailQueue } = require('../../queues/gmailQueue');

//Handles incoming POST requests from Google Pub/Sub
module.exports.gmailWebHooksHandler = async (req,res)=>{
    try{
        const pubSubMessage = req.body.message;
        if(!pubSubMessage || !pubSubMessage.data){
            console.error('Invalid Pub/Sub message format');
            return res.status(400).send('Invalid Format');
        }
        // 2. Decode the Base64 data string
        const decodedString = Buffer.from(pubSubMessage.data, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedString);
        console.log('Received Gmail webhook message:', payload);

        const { emailAddress, historyId } = payload;
        if(!emailAddress || !historyId){
            console.error('Missing emailAddress or historyId in payload');
            return res.status(400).send('Missing Data');
        }
        // Add a job to the Gmail queue for processing
        await gmailQueue.add("process-gmail-notification", {
            emailAddress,
            historyId
        },{
            removeOnComplete:true,
            attempts:3,
            backoff: { type: 'exponential', delay: 5000}
        }
        );


    }catch(error){
        console.error('Error handling Gmail webhook:', error.message);
        return res.status(500).send('Internal Server Error!');
    }
}