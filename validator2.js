

// Validator('#register-form',
//     { onSubmit: function () { console.log('Call API...') } }
// );

// function Validator(formSelector, options) 
function Validator(formSelector) {
    // Gán giá trị mặc định cho tham số khi định nghĩa
    // if (!options) { options = {}; }

    const _this = this;

    // Nguyên tắc làm việc truyền element hiện tại(thẻ input)=> truyền class của thẻ cha
    function getParent(element, selector) {

        while (element.parentElement) {
            // Tránh trường hợp thẻ input nằm trong nhiều thẻ div ví dụ:
            // <div>
            //     <div>
            //         <input> </input>
            //     </div>
            // </div>
            // Giải thích: kiểm tra thẻ cha có class giống với selector hay không
            // Nếu giống: return thẻ cha đó-----Nếu sai: gán thẻ con mới thành thẻ cha đó và thực hiện tiếp vòng lặp
            // với thẻ con mới bây giờ là thẻ cha lúc trước.
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            // Để tránh lặp vô hạn thì phải gán thẻ con mới thành thẻ cha đó và thực hiện tiếp vòng lặp
            // với thẻ con mới bây giờ là thẻ cha lúc trước và tiếp tục vòng lặp đến khi return để kết thúc/
            element = element.parentElement;
        }
    };

    // Biến chứa tất cả giá trị
    const formRules = {};

    // Quy ước tạo rules:
    // Nếu có lỗi sẽ return `errorMessage`
    // Nếu không có lỗi sẽ return `undefined`

    const validatorRules = {
        // required là KEY có VALUE là 1 function, nếu sau này có ký tự trong input 
        // thì giá trị sẽ được gọi trong hàm required và truyền value của input vào trong function
        // Từ value trong function sẽ kiểm tra xem có lỗi hay không và tuân thủ quy ước tạo rules
        required: (value) => { return value ? undefined : "Vui lòng nhập trường này" },
        email: (value) => {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập đúng định dạng email"
        },
        // Sử dụng function lồng nhau, kết quả function1 là function2
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min}ký tự`
            }
        },
        confirm: (value) => {
            return value === formElement.querySelector('#password').value ? undefined : "Giá trị nhập lại không đúng"
        }
    }

    // Lấy ra formElement trong DOM theo formSelector
    const formElement = document.querySelector(formSelector);
    // console.log(formElement)=<form action="" method="POST" class="form" id="register-form"></form>

    // Chỉ xử lý khi element có trong DOM
    if (formElement) {

        // Cần xác thực cho cái gì =>Lấy tất cả các thẻ input nằm trong formSelector có att rule&name
        // console.log(inputs)= [input#fullname.form-control, input#email.form-control, input#password.form-control]
        let inputs = formElement.querySelectorAll('[name][rules]');

        for (let input of inputs) {
            // console.log(input) = <input type="text....>

            // split sẽ tách các string ra thành từng mảng 
            let rules = input.getAttribute('rules').split('|');
            // console.log(rules)=['required'] ['required', 'email'] ['required', 'min:6']

            for (let rule of rules) {
                // Khai báo biến ruleInfo
                let ruleInfo;
                // Tất cả các rule có chứa kí tự :
                let isRuleHasValue = rule.includes(':');
                // isRuleHasValue=min:6

                // Gán lại giá trị cho biến ruleInfo
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    // ruleInfo= ['min', '6']
                    rule = ruleInfo[0];
                }

                // rule = required,email,min:6.
                let ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {

                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                // Lần 1: validatorRules là {} nên sẽ lọt vào else
                // Lần 2: 
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
                // console.log(validatorRules[rule])= tất cả function của: required,email, min:6
                // formRules[input.name] = input.getAttribute('rules');
                // console.log(input.getAttribute('rules'));=> required, required|email, required|min:6,
                // console.log(input.name)=email,fullname,password
            }
            // Lắng nghe sự kiện để validate(blur,change)
            input.onblur = handleValidate;
            // Lắng nghe sự kiện nhập vào input
            input.oninput = handleClearError;

        }
        // Hàm thực hiện validate
        function handleValidate(event) {
            // e.target => lấy ra element của thẻ input đang thao tác
            // e.target.value=> lấy ra value(các kí tự khi nhập vào input) của input
            // e.target.name=> lấy ra các name: email, fullname, password
            let rules = formRules[event.target.name];
            let errorMessage;

            for (let rule of rules) {
                switch (event.target.type) {
                    case 'radio':
                    case 'checkbox ':
                        errorMessage = rule(formElement.querySelector('input[name="gender"]' + ':checked'));
                        break;
                    default:
                        errorMessage = rule(event.target.value);
                }
                if (errorMessage) {
                    break;
                }
            }

            // Dùng find khi có lỗi thì break khỏi vòng lặp
            // rules.find(rule => {
            // switch (event.target.type) {
            //     case 'radio':
            //     case 'checkbox ':
            //         errorMessage = rule(formElement.querySelector('input[type="radio"]' + ':checked'));
            //         break;
            //     default:
            //         errorMessage = rule(event.target.value);
            // }
            // return errorMessage;
            // });

            // Check nếu có lỗi thì hiện thị message lỗi ra UI
            // Tạo function formGroup để lấy được thẻ cha của input có class trùng với selector,
            // từ thẻ cha của input chọc vào thẻ form-message rồi innerHTML để in ra lỗi
            if (errorMessage) {
                let formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    // Vì đã css 1 invalid có chữ màu đỏ để báo lỗi
                    formGroup.classList.add('invalid');
                    // Vì đã css 2 invalid có chữ màu đỏ để báo lỗi
                    let formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
            // Khi không có message lỗi thì return về true
            return !errorMessage;
        }

        // Chạy function clearError=> kiểm tra form-group có class invalid hay không? nếu có clear, không có thì ngừng.
        function handleClearError(event) {
            let formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                let formMessage = formGroup.querySelector('.form-message')
                if (formMessage) {
                    formMessage.innerText = "";
                }
            }
        }
    }
    // console.log(formRules);
    // Lần đầu: console.log(formRules) = {email: "required|email",fullname: "required",password: "required|min:6"};
    // Sau : console.log(formRules) = {fullname: Array(1), email: Array(2), password: Array(2)}

    // Xử lý hành vi submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();
        let inputs = formElement.querySelectorAll('[name][rules]');



        // Nếu form hợp lệ = true thì sẽ chấp chận submit form, false sẽ từ chối và thông báo lỗi
        let isValid = true;
        for (let input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            }
        }
        // Khi form hợp lệ(isValid) thì: 
        // nếu options.onSubmit là 1 function thì sẽ submit mặc định thẻ form
        // nếu không thì submit formElement thực thi tham số thứ 2 của: 
        // Validator('#register-form',{ onSubmit: function () { console.log('Call API...') } } );
        if (isValid) {
            if (typeof _this.onSubmit === "function") {
                let enableInputs = formElement.querySelectorAll('[name]');
                let formValues = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            // Nếu là checkbox không được check=> return value
                            if (!input.matches(':checked')) {
                                values[input.name] = [];
                                return values;
                            }

                            // Nếu check box được check thì đi xuống dòng else để push(thêm) input.value
                            if (!Array.isArray(values.input.name)) {
                                values[input.name] = [];
                            } else
                                values[input.name].push(input.value)
                            break;
                        case 'file':
                            values[input.name] = input.files
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                }, {});
                _this.onSubmit(formValues);

            } else {
                formElement.submit();
            }
        }
    }
}


