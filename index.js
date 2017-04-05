// Three Doors
// Written by ironbraid74@gmail.com

const action_final_response = require('./json/action-final-response.json')
const action_response = require('./json/action-response.json')
const doors = require('./json/doors.json')
const greetings = require('./json/greetings.json')
const nomatch = require('./json/nomatch.json')
const objects = require('./json/objects.json')
const pickDoor = require('./json/pickDoor.json')
const rooms = require('./json/rooms.json')
const _ = require('lodash')

exports.three_doors = function three_doors (req, res) {
	res.setHeader('Content-Type', 'application/json')
	res.append("Google-Assistant-API-Version", "v1")

	var userInput = req.body.inputs[0].raw_inputs[0].query

	if (req.body.conversation.type == '1') {
		var this_response = action_response
		this_response.expected_inputs[0].input_prompt.initial_prompts[0].text_to_speech = _.sample(greetings) + ' ' + _.sample(doors) + ' ' + _.sample(rooms) + ' ' + _.sample(objects) + '. ' + _.sample(pickDoor)
		res.json(this_response)

	} else if (userInput.match(/stop/i)) {
		res.json(action_final_response)

	} else if (userInput.match(/((first|second|third)\s*(door|one)?|((door|door number|number)\s)?([123]|one|two|three))/i)) {
		var this_response = action_response
		this_response.expected_inputs[0].input_prompt.initial_prompts[0].text_to_speech = _.sample(doors) + ' ' + _.sample(rooms) + ' ' + _.sample(objects) + '. ' + _.sample(pickDoor)
		res.json(this_response)	

	} else {
		var this_response = action_response
		this_response.expected_inputs[0].input_prompt.initial_prompts[0].text_to_speech = _.sample(nomatch)
		res.json(this_response)		
	} 
	res.status(200).end()
}