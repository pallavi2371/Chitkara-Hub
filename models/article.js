const mongoose=require('mongoose');
const marked = require('marked');
const slugify= require('slugify');
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')  //getting only jsdom portion
const dompurify = createDomPurify(new JSDOM().window)  //creating jsdom window object

const articleSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    markdown:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    slug: {
        type: String,
        required:true,
        unique:true
    },
    sanitizedHtml: {
        type: String,
        required: true
      }
})

articleSchema.pre('validate',function(next){   //if we edit our title then we need to change it in our address also
    if(this.title){
        this.slug =slugify(this.title , { lower:true, strict: true})
    }
    if(this.markdown){            //convert markdown to html(sanitized)
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))  //sanitizing html using markdown
    }
    next()  //go onto the next func in the list
})

module.exports =mongoose.model('Article',articleSchema);