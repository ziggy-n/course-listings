import React, { Component } from 'react';
import { MyContext } from './Context';
import { Link } from 'react-router-dom';
import ValidationError from './ValidationError';


class UpdateCourse extends Component {

    constructor(props){
        super(props);

        this.state = {
          ownerFirstName: null,
          ownerLastName: null,
          ownerId: null,

          courseTitle: "",
          courseDescription: "",
          courseEstimatedTime: "",
          courseMaterialsNeeded: "",

          hasTitle: true,
          hasDescription: true,

          courseId: null,

          valError: false,
          errorMsg: null,
          errorIsString: false
        };
    }
    

    async componentDidMount(){

        let id = this.props.match.params.val;
        let course = null;
        let owner = null;

        let status = null;
        await fetch(`http://localhost:5000/api/courses/${id}`
            ).then(function(response){
                status = response.status;
                return response.json();
            }).then(function(data){
                owner = data.owner;
                course = data.course;
            }).catch(function(err){
                console.log('error occurred fetching course details');
            });

        console.log("course here: ");
        console.dir(course);
        console.dir(owner);
        
        if(!course){
            this.props.history.push('/notfound');
            return null;
        }

        if(status === 500){
            this.props.history.push('/error');
            return null;
        }

        if(owner.id !== this.context.currentAuthUserId){
            this.props.history.push('/forbidden');
            return null;
        }

        this.setState({
            courseId: id,
            ownerFirstName: owner.firstName || "",
            ownerLastName: owner.lastname || "",
            ownerId: owner.id || null,
            courseTitle: course.title || "",
            courseDescription: course.description || "",
            courseEstimatedTime: course.estimatedTime || "",
            courseMaterialsNeeded: course.materialsNeeded || ""
        });

        
    }


    handleChangeTitle = (event) => {
        event.preventDefault();
        this.setState({
            courseTitle: event.target.value
        });
    }

    handleChangeDescription = (event) => {
        event.preventDefault();
        this.setState({
            courseDescription: event.target.value
        });
    }

    handleChangeEstimatedTime = (event) => {
        event.preventDefault();
        this.setState({
            courseEstimatedTime: event.target.value
        });
    }

    handleChangeMaterialsNeeded = (event) => {
        event.preventDefault();
        this.setState({
            courseMaterialsNeeded: event.target.value
        });
    }


    handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            estimatedTime: this.state.courseEstimatedTime,
            materialsNeeded: this.state.courseMaterialsNeeded,
            userId: this.context.currentAuthUserId
        }

        if(this.state.courseTitle === ""){
            data.title = null;
        } else {
            data.title = this.state.courseTitle;
        }

        if(this.state.courseDescription === ""){
            data.description = null;
        } else {
            data.description = this.state.courseDescription
        }

        // let validationErrors = [];
        // if(this.state.courseTitle === ""){
        //     validationErrors.push("Course Title is required");
        // } else {
        //     data.title = this.state.courseTitle;
        // }

        // if(this.state.courseDescription === ""){
        //     validationErrors.push("Course description is required")
        // } else {
        //     data.description = this.state.courseDescription
        // }

        // if(validationErrors.length > 0){
        //     this.setState({
        //         valError: true,
        //         errorMsg: validationErrors,
        //         errorIsString: false
        //     });
        //     return null;
        // }

        // set options
        const options = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        }

        // dealing with credentials
        const encodedCredentials = btoa(`${this.context.currentAuthUserEmail}:${this.context.currentAuthUserPassword}`);
        options.headers['Authorization'] = `Basic ${encodedCredentials}`;


        let status = null;
        // 
        let responseobj = await fetch(`http://localhost:5000/api/courses/${this.state.courseId}`, options)
        .then(response => {
            console.log("first then");
            status = response.status;
            if(response.status === 204){
                // this.intermediary.valError = false;
                // this.intermediary.errorMsg = null;
                // this.intermediary.errorIsString = false;
                console.log('successful course update occurred');
                
                this.props.history.push(`/courses/${this.state.courseId}`);
                return null;
            } else {
                return response.json();
            }
        }).catch(err => {
            console.log("api request failed");
            this.props.history.push('/error');
        });

        if(responseobj){
            console.log("second then");
            console.dir(responseobj);
            if(responseobj.error.message){
                console.log("error occurred during course update");
                if(typeof responseobj.error.message === 'string'){
                    this.setState({
                        valError: true,
                        errorMsg: responseobj.error.message,
                        errorIsString: true
                    });
                } else {
                    this.setState({
                        valError: true,
                        errorMsg: responseobj.error.message,
                        errorIsString: false
                    });
                }
                
                
            }
        }
 
        console.log("status? " + status); 

        if(status === 500){
            this.props.history.push('/error');
        }

    }



    render() {
        console.log("inside update course render");

            return(
                <div className="bounds course--detail">
                    <h1>Update Course</h1>
                    <div>
                        <ValidationError 
                                valError={this.state.valError}
                                errorMsg={this.state.errorMsg}
                                errorIsString={this.state.errorIsString}
                        />
                        <form onSubmit={this.handleSubmit}>
                            <div className="grid-66">
                                <div className="course--header">
                                    <h4 className="course--label">Course</h4>
                                    <div>
                                        <input id="title" name="title" type="text" className="input-title course--title--input" placeholder="Course title..." value={this.state.courseTitle} onChange={this.handleChangeTitle} />
                                    </div>
                                    <p>By {this.state.ownerFirstName} {this.state.ownerLastName}</p>
                                </div>
                                <div className="course--description">
                                    <div>
                                        <textarea id="description" name="description" placeholder="Course Description..." value={this.state.courseDescription} onChange={this.handleChangeDescription} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid-25 grid-right">
                                <div className="course--stats">
                                    <ul className="course--stats--list">
                                        <li className="course--stats--lists--item">
                                            <h4>Estimated Time</h4>
                                            <div>
                                                <input id="estimatedTime" name="estimatedTime" type="text" className="course--time--input" placeholder="Hours" value={this.state.courseEstimatedTime} onChange={this.handleChangeEstimatedTime}  />
                                            </div>
                                        </li>
                                        <li className="course--stats--lists--item">
                                            <h4>Materials Needed</h4>
                                            <div>
                                                <textarea id="materialsNeeded" name="materialsNeeded" placeholder="List materials..." value={this.state.courseMaterialsNeeded} onChange={this.handleChangeMaterialsNeeded}  />
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="grid-100 pad-bottom">
                                <button className="button" type="submit" onClick={this.handleSubmit}>Update Course</button>
                                <Link className="button button-secondary" to={`/courses/${this.props.match.params.val}`}>Cancel</Link>
                            </div>
                        </form>
                    </div>
                </div>
            );

    }
}

UpdateCourse.contextType = MyContext;
export default UpdateCourse;