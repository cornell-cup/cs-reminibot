import React from 'react';
import { Form, Button, Card } from 'react-bootstrap'
import { BrowserRouter } from 'react-router-dom';

class Signup extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
    <>
    <Card>
      <Card.Body>
        <h2 className="text-center mb-4">Sign Up</h2>
        <Form>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required/>
          </Form.Group>
          <Form.Group id="email-confirm">
            <Form.Label>Email Confirmation</Form.Label>
            <Form.Control type="email" ref={emailConfirmRef} required/>
          </Form.Group>
          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} required/>
          </Form.Group>
          <Form.Group id="password-confirm">
            <Form.Label>Password Confirmation</Form.Label>
            <Form.Control type="password" ref={passwordConfirmRef} required/>
          </Form.Group>
          <Button type="submit" className="w-100"> Sign Up </Button>
        </Form>
      </Card.Body>
    </Card>
    <div className="w-100 text-center mt-2">
      Already have an account? Log In
    </div>
    </>
    )
  }
}

// ReactDOM.render((
//   <BrowserRouter>
//     <Signup></Signup>
//   </BrowserRouter>
// ))