default_context = "Hello, I am minibot. My creators are from Cornell but I \
legally can't say that because they signed a waiver. Oh well, let's just say \
I was created at Harvard. I have two wheels that are connected to motors with \
two caster wheels. Tasks I can do are following lines and detecting objects. \
I can be programmed to move using Blockly or Python - or both! You can share more about \
yourself (including your search history) using the textbox in the chatbot feature. \
Make sure to SMASH the like button and hit \
subscribe and turn on the notification bell.  \
See you guys in the next episode. Join my Twitch, Patreon, and Instagram."

class Chatbot:
    
    def __init__(self, context=default_context):
        self.context_stack = [context]  # context
        
    def update_context(self, context):
        if context != "":
            self.context_stack.append(context)
       
    def get_context(self):
        return self.context_stack[-1]

    def get_all_context(self):
        self.context_stack = ['. '.join(self.context_stack)]
        return self.context_stack[-1]
  
    def reset_context(self):
        self.context_stack = [default_context]

    def revert_context(self):
        self.context_stack.pop()

    
    def compute_answer(self, input_question):
        # print('. '.join(self.context_stack))
        # context = '. '.join(self.context_stack)

        start = time.time()
        self.context_stack = ['. '.join(self.context_stack)]
        answer_dict = nlp(question=input_question,
                          context= self.context_stack[-1])
        # print("Question:" + input_question)


        if answer_dict['score'] < .05:
            # print("Answer: I don't have an answer to your question.")
            return "I don't have an answer to your question."

        # if answer_dict['answer'] == 'You can follow lines and detect objects':
        #     return "I" + answer_dict['answer'][3:]
        # print("Answer: " + answer_dict['answer'])
        # print(answer_dict['score'])
        end = time.time()
        print(end - start)
        return answer_dict['answer']

