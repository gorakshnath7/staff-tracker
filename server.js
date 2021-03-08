const inquirer = require('inquirer');
const Choices = require('inquirer/lib/objects/choice')
// const { prompt } = require('inquirer');
// const { Server } = require('node:http');
const { inherits } = require('util');
const { delDept } = require('./db/index');
// const { employeeSearch, roleSearch } = require('./db/index');
const db = require('./db/index')
//initialize program
var employee 
var empRole_id;
var empMid;

var department

init();

function init(){
    runSearch()
}
//initialize prompt questions
async function runSearch(){
    const {action} = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do today?',
      choices: [
        {   name: 'Review a list of all our employees',
            value: "VIEW_EMPLOYEES",
        },
        {   name: 'Review a list of all departments and associated budgets',
            value: "VIEW_DEPARTMENTS",
        },
        {   name: 'Review a list of roles within the company',
            value: "VIEW_ROLES",
        },
        {   name: 'View all managers',
            value: "VIEW_STAFF_BY_MGR",
        },
        {   name: 'Add a new employee',
            value: "ADD-EMPLOYEE",
        },
        {   name: 'Change a role in the company',
            value: "ADD_ROLE",
        },
        {   name: 'Change the role of an employee in the organization',
            value: "EDIT_ROLE",
        },
        {   name: 'Change or add a department',
            value: "CHANGE_DEPARTMENT",
        },
        {   name: 'Quit',
            value: "QUIT",
        },
        ],  
    },
    ]
    )

//activate functions depending on response to prompts
    switch (action) {
        case "VIEW_EMPLOYEES":
            viewAllEmployee();
            break;

        case "VIEW_DEPARTMENTS":
            viewAllDeparments();    
            break;

        case "VIEW_ROLES":
            viewRoles()
            break;

        case "VIEW_STAFF_BY_MGR":
            viewAllMgr()
            break;

        case "ADD-EMPLOYEE":
            addNewEmployee()  
            break;
          
        case "ADD_ROLE":
            addRole()  
            break;

        case "EDIT_ROLE":
            updateRole()  
            break;

        case "CHANGE_DEPARTMENT":
            changeDept()  
            break;

        default:
        quit()  
    }
    
};

//collect db search results to a variable and display in console
async function viewAllEmployee()  {
   
    let results = await db.employeeSearch();
    console.table(results)
    runSearch();
}

async function viewAllDeparments()  {
    let results = await db.departmentSearch();
    console.table(results);   
    runSearch();
}

async function viewRoles()  {
    let results = await db.roleSearch();
    console.table(results);
    runSearch();
}

async function viewAllMgr()  {
    let results = await db.mgrSearch();
    console.table(results);
    runSearch();
}

async function addNewEmployee() {
    let roles = await db.roleSearch()
    console.log(roles)
    let manager = await db.mgrSearch()
    console.log(manager)

    var newEmp = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'What is the first name of the new Employee?',
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'What is last name of the New Employee?',
            },
            {
                type: 'list',
                name: 'title',
                message: 'What will the role of the new Employee be?',
                choices(){
                    const fullRoleList = []
                    roles.forEach(({id, Title}) => {
                        fullRoleList.push(id + ' ' + Title);
                    });
                    return fullRoleList;
                },
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Who will be the Manager of the new employee?',
                choices(){
                    const managerList = []
                    manager.forEach(({id, first_name, last_name}) => {
                        managerList.push(id + ' ' + first_name + ' ' + last_name);
                    });
                    return managerList;
                },
            },
        ]);
    var result = newEmp.title.split(' ')
    var role = result[0]
    var mgr = newEmp.manager.split(' ')
    var empMid = mgr[0] 

    var employee = {
        first_name: newEmp.first_name,
        last_name: newEmp.last_name,
        role_id: role,
        manager_id: empMid,
    }
    console.log('adding New Employee:', employee)
    db.addEmployee(employee)

    runSearch()

}

async function addRole(){
    var newRole = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What role would you like to add?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What salary would be associated with this role?',
            },
            {
                type: 'list',
                name: 'department',
                message: 'What department would that role be a part of?',
                choices:['Sales', 'Finance', 'Engineering', 'Legal']

            },
    ])

    let dept_num;
    if (newRole.department === 'Sales'){ dept_num = 1} 
    else if (newRole.department === 'Engineering'){dept_num = 2}
    else if (newRole.department === 'Finance'){dept_num = 3}
    else if (newRole.department === 'Legal'){dept_num = 4}

    var newRole = {
        title : newRole.title,
        salary : newRole.salary,
        department_id : dept_num,
    }
    let result = await db.addRole(newRole);
    console.log("new role added:")
    console.table(newRole)
    runSearch()       

}

async function changeDept(){
    let departments =  [
        {id: 1, name: 'Sales'},
        {id: 2, name: 'Engineering'},
        {id: 3, name: 'Finance'},
        {id: 4, name: 'Legal'},
    ]

    departments.push({ id: 0, name: "+ New Department"})
    const response = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What department action shall we do?',
                choices: [{ value: 'edit', name: 'Add/Edit Department'}, 
                        {value: 'del', name: 'Delete Department'}]
            },
            {
                type: 'list',
                name: 'name',
                message: 'Choose the department:',
                choices: departments
            },
    ])

    console.log("chosen action:", response)

    if( response.action === 'del'){
        delDept()}
        else if ( response.action === 'edit'){
            editDept()}
            else {addDept()}

    async function delDept(){
        let result = await db.delDept(response.name)
        console.log( `deleting ${response.name}`)
    }

    // async function editDept(){

    //         const response = await inquirer.prompt([
    //             {
    //                 type: 'input',
    //                 name: 'name',
    //                 message: 'What would you like the new department name to be?'
    //             }
    //             ])
        
    //     db.editDept(response.name)
    //     console.log( `updating department name to ${response.name}`)
    // }
    
    //         var chgDept = 
    //             {   id: response.name,
    //                 name: update.name }

    //         let result = await db.editDept(chgDept)
    //             console.log( `editing ${response.department_id}`)
    //             } else  { 
    //                 let result = await db.addDept(chgDept)
    //                 console.log( `adding new department !`)
    //         } else {console.log( 'Sorry unable to do this! try again')
    //     }
    //     }
    // }
 
    // console.table(newDept)
    runSearch()       

}

async function updateRole(){

    var employees = await db.getEmployees();
    console.table(employees)

    var update = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: "What is the index number associated with the employee?",
            },
            {
                type: 'input',
                name: 'role',
                message: 'What new role would you like to assign to this employee',
            }
    ])

    if (update.role === 'Sales Rep'){ role_num = 1} 
    else if (update.role === 'Sales Lead'){role_num = 3}
    else if (update.role === 'Software Engineer'){role_num = 4}
    else if (update.role === 'Lead Engineer'){role_num = 5}
    else if (update.role === 'Financial Team Lead'){role_num = 10}
    else if (update.role === 'Accountant'){role_num = 6}
    else if (update.role === 'Lawyer'){role_num = 8}
    else if (update.role === 'Legal Team Lead'){role_num = 17}


    var updatedRole = 
        {   role_id: update.role_nm,
            id : update.id, }

    let result = await db.editRole(updatedRole);
    console.table(updatedRole)
    runSearch()       

}

async function deleteEmployee(){
    var employees = {};
    var employees = await db.getEmpName();
    console.table(employees)
    
    var result = await inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'What is the index number of the employee you would like to remove?',
            },
    ])

    
    var delEmpl = { 
        id: result.id, }
    let deleted = await db.delEmployee(delEmpl);
    console.log("This employee has been removed:")
    console.table(deleted )
    runSearch()       

}



function quit(){
    process.exit()
}
