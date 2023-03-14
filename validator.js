





// Đối tượng validator
function Validator(option) {
    const selectorRules = {};
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        const errorElement = inputElement.parentElement.querySelector(option.errorSelector);
        // const msgError = rule.test(inputElement.value);
        let msgError;
        // Lấy ra các rule của selectorRules 
        const rules = selectorRules[rule.selector];
        // Lặp và kiểm tra, nếu lỗi dừng
        for (let i = 0; i < rules.length; i++) {
            msgError = rules[i](inputElement.value);
            if (msgError) break;
        }
        if (msgError) {
            errorElement.innerText = msgError;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove('invalid');
        }
    }

    // Lấy element của form cần validate
    const formElement = document.querySelector(option.form);
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            // Lặp qua từng rule và validate form
            option.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector);
                validate(inputElement, rule);
            })
        }
        // Lặp qua mỗi rules và xử lý lắng nghe(blur,input)
        option.rules.forEach(rule => {
            // Lưu rules
            // console.log(rule.selector)= string nên sẽ sử dụng để truy cập vào obj như sau
            // selectorRules[rule.selector]
            // Ta sẽ gán function test là phương thức của object selectorRules
            // Vì kết quả của object selectorRules không lưu được tất cả các rules(vì dùng gán "=" nên cái sau
            // sẽ ghi đè cái trước) nên ta sẽ lưu tất cả các rules vào 1 mảng gồm nhiều phần tử
            /**
            Cấu trúc điều kiện sẽ chạy như sau:
            Lần 1: selectorRules[rule.selector] đang là undefined vì selectorRules là obj rỗng nên sẽ lọt vào 
            điều kiện else.
            Lần 2: selectorRules[rule.selector] lọt vào else và được gán cho bằng 1 array.
            Lần 3: Vì sử dụng vòng lặp forEach nên selectorRules[rule.selector] sẽ lặp lại.
            Lần 4: Bây giờ selectorRules[rule.selector] đã là 1 array nên sẽ lọt vào vòng lặp này và được push
            vào ngay chính object rỗng selectorRules={}
            */

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }



            let inputElement = formElement.querySelector(rule.selector);
            // console.log(inputElement);
            // Xử lý TH blur khỏi input
            if (inputElement) {
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }
            }

            // Xử lý TH khi người dùng nhập input
            if (inputElement) {
                inputElement.oninput = () => {
                    const errorElement = inputElement.parentElement.querySelector(option.errorSelector);
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        });
    }
};

// Định nghĩa rules
// Rule:
// Lỗi=> Trả ra thông báo lỗi
// Không lỗi=> Để im(undefined)

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || "Vui lòng nhập trường này"
        }
    }
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Đây phải là email"
        }
    }
};

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nập tối thiểu ${min} ký tự`;
        }
    }
};

Validator.isComfirmed = function (selector, getCorfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getCorfirmValue() ? undefined : message || `Giá trị nhập lại chưa đúng`;
        }
    }
};