$( document ).ready(function() {
    // Constantes
    var base_url = "https://www.mt4.com.br/vagas/desenvolvedor-frontend-junior/api/";
    var token    = localStorage['token'] || 'FxZmZUuuryEEZy8mJUSVEwELMKEvATILsQR1ZQRkAwD1AwR=';
    $('.modal').modal();

    var Contact = {
        // Init Function
        init: function(params) {
            this.params = params;
            this.bindUI();
            this.getApiParams();
        },

        bindUI: function () {
            var that = this;
            // Add email field to form
            $("body").on("click","#add-email-field",function(){
                var count_email_fields = $(this).closest("form").find("#email-group").children(".input-field").length;
                $(this).closest("form").find("#email-group").append(
                    '<div class="input-field col s12">' +
                        '<i class="material-icons prefix">email</i>' +
                        '<input id="email" type="email" name="email-'+count_email_fields+'">' +
                        '<label for="email">E-mail</label>' +
                    '</div>'
                );
            });

            // Add phone field to form
            $("body").on("click","#add-phone-field",function(){
                var count_phone_fields = $(this).closest("form").find("#phone-group").children(".input-field").length;
                $(this).closest("form").find("#phone-group").append(
                    '<div class="input-field col s12">' +
                        '<i class="material-icons prefix">phone</i>' +
                        '<input id="phone" type="tel" name="phone-'+count_phone_fields+'">' +
                        '<label for="phone">Telephone</label>' +
                    '</div>'
                );
            });

            // Open Create Contact Modal
            $("body").on("click","#open_create_modal",function(){
                $("#create_modal").find("input[name='email-0']").val('');
                $("#create_modal").find("input[name='phone-0']").val('');
                $("#create_modal").modal('open');
                $("#btn_create_item").on('click', function(event){
                    event.preventDefault();
                    var array_create_email = [];
                    var array_create_phone = [];
                    var name = $("#create_modal").find("input[name='name']").val();

                    var count_input_email = $('#create_form').find("input[type='email']").length;
                    for (var i = 0; i < count_input_email; i++) {
                        array_create_email.push($("#create_modal").find("input[type='email']").eq(i).val());
                    }

                    var count_input_phone = $('#create_form').find("input[type='tel']").length;
                    for (var i = 0; i < count_input_phone; i++) {
                        array_create_phone.push($("#create_modal").find("input[type='tel']").eq(i).val());
                    }

                    that.storeItem(name, array_create_email, array_create_phone);
                });
            });

            // Remove Item
            $("body").on("click",".remove_item",function(){
                var id = $(this).parent("td").data('id');
                var c_obj = $(this).parents("tr");
                that.removeItem(id, c_obj);
            });

            // Open Edit Contact Modal
            $("body").on("click",".open_edit_modal",function(){
                var id = $(this).parent("td").data('id');
                $("#edit-contact-id").val(id);
                $("#edit_modal").find("#email-group").html('');
                $("#edit_modal").find("#phone-group").html('');
                that.editItem(id);
            });

            // Open View Contact Modal
            $("body").on("click",".open_contact_view_modal", function(event) {
                event.preventDefault();
                var id = $(this).parent("td").data('id');
                that.viewContact(id);
            });

            // Search Query
            $("body").on('keyup', '#search-criteria', function(event) {
                var search_key = $(this).val().toLowerCase();
                that.SearchQuery(search_key);
            });

            // Call Funcion Update Contact
            $("#btn_edit_item").click(function(event){
                event.preventDefault();
                var array_email = [];
                var array_phone = [];
                var id = $("#edit-contact-id").val();
                var name = $("#edit_modal").find("input[name='name']").val();

                var count_input_email = $('#edit-form').find("input[type='email']").length;
                for (var i = 0; i < count_input_email; i++) {
                    array_email.push($("#edit_modal").find("input[type='email']").eq(i).val());
                }

                var count_input_phone = $('#edit-form').find("input[type='tel']").length;
                for (var i = 0; i < count_input_phone; i++) {
                    array_phone.push($("#edit_modal").find("input[type='tel']").eq(i).val());
                }

                that.updateItem(name, array_email, array_phone, id);
            });
        }, // End Bind UI

        // Get Api Token
        getApiParams: function(){
            that = this;
            $.ajax({
                dataType: 'json',
                method:'POST',
                url: base_url + "token",
            }).done(function(data){
                var data_token = data.token;
                toastr.success('Token Autorizado.', {timeOut: 5000});
                localStorage['token'] = data_token;
                that.getData();
            })
            .fail(function(data) {
                toastr.success('Token Inválido.', {timeOut: 5000});
            });
        },

        // manage data list
        getData: function() {
            that = this;
            $.ajax({
                method: "GET",
                dataType: 'json',
                url: base_url + "listar?token=" + token,
            }).done(function(data){
                var total_page = Math.ceil(data.data.length / 10);

                for (var i = 1; i <= total_page; i++) {
                    if (i == 1) {
                        $('#pagination').append('<li>' +
                                                    '<a class="chevron-left-link">' +
                                                        '<i class="material-icons">chevron_left</i>' +
                                                    '</a>' +
                                                '</li>')
                    }
                    $('#pagination').append('<li class="waves-effect">' +
                                                '<a class="page-link" id="'+i+'" >' + i + '</a>' +
                                            '</li>')

                    if (i >= total_page) {
                        $('#pagination').append('<li>' +
                                                    '<a class="chevron-right-link">' +
                                                        '<i class="material-icons">chevron_right</i>' +
                                                    '</a>' +
                                                '</li>')
                    }
                }

                $(function(){
                    var select_page  = 1;
                    var current_page = 1;

                    $('.page-link').on('click', function(){
                        select_page  = parseInt($(this).attr('id'));
                        current_page = select_page;
                        that.getPageData(select_page);
                    });

                    $('.chevron-left-link').on('click', function(){
                        if (current_page > 1) {
                            select_page  = parseInt((--select_page));
                            current_page = select_page;
                            that.getPageData(select_page);
                        }
                    });

                    $('.chevron-right-link').on('click', function(){
                        if (current_page < total_page) {
                            select_page  = parseInt((++select_page));
                            current_page = select_page;
                            that.getPageData(select_page);
                        }
                    });
                });

                that.getFirstPage();
            })
            .fail(function(data) {
                toastr.error('Não Conseguimos processar os dados da página.', {timeOut: 5000});
            });
        },

        // Get Page Data
        getFirstPage: function () {
            that = this;
            $.ajax({
                dataType: 'json',
                url: base_url + "listar?token=" + token + "&page=" + 1,
            }).done(function(data){
                that.manageRow(data.data);
            })
            .fail(function(data) {
                toastr.error('Não Conseguimos processar os dados da página.', {timeOut: 5000});
            });
        },

        // Get Page Data
        getPageData: function(selected_page) {
            that = this;
            var select_page = selected_page;
            $.ajax({
                dataType: 'json',
                url: base_url + "listar?token=" + token + "&page=" + select_page,
            }).done(function(data){
                that.manageRow(data.data);
                $("#current-page").html(select_page);
                $('#pagination').find('li').removeClass("active");
                $('#pagination').find('li').eq(select_page).addClass("active");
            })
            .fail(function(data) {
                toastr.error('Não Conseguimos processar os dados da página.', {timeOut: 5000});
            });
        },

        // Add new Item table row
        manageRow: function (data) {
            var	rows = '';
            $.each( data, function( key, value ) {
                rows = rows + '<tr>';
                rows = rows + '<td>'+value.id+'</td>';
                rows = rows + '<td>'+value.name+'</td>';
                rows = rows + '<td data-id="'+value.id+'">';
                rows = rows + '<button class="btn-floating waves-effect waves-light open_contact_view_modal"><i class="material-icons">search</i></button>';
                rows = rows + '<button class="btn-floating waves-effect waves-light btn open_edit_modal"><i class="material-icons">edit</i></button>';
                rows = rows + '<button class="btn-floating waves-effect waves-light btn red remove_item"><i class="material-icons">delete</i></button>';
                rows = rows + '</td>';
                rows = rows + '</tr>';
            });

            $("tbody").html(rows);
        },

        storeItem: function(name, array_create_email, array_create_phone){
            var name = name;
            array_create_email = array_create_email,
            array_create_phone = array_create_phone

            if(name != ''){
                $.ajax({
                    dataType: 'json',
                    type:'POST',
                    contentType: "application/x-www-form-urlencoded",
                    url: base_url + "salvar",
                    data:{
                            name:name,
                            email:array_create_email,
                            phone:array_create_phone,
                            token:token
                        }
                }).done(function(data){
                    $(".modal").modal('close');
                    toastr.success('Cadastrado com Sucesso.', {timeOut: 5000});
                });
            }else{
                toastr.error('Desculpe, Não conseguimos Cadastrar.', {timeOut: 5000});
            }
        },

        removeItem: function(id, c_obj){
            var id = id;
            var c_obj = c_obj;

            $.ajax({
                type:'DELETE',
                url: base_url + "excluir?token=" + token + "&id=" + id,
                data: {id:id}
            }).done(function(data){
                c_obj.remove();
                toastr.success('Contato Deletado com Sucesso.', {timeOut: 5000});
                getPageData();
            })
            .fail(function(data) {
                toastr.error('Não foi possível deletar o Contato.', {timeOut: 5000});
            });
        },

        editItem: function(id){
            var id = id;
            $.ajax({
                dataType: 'json',
                url: base_url + 'detalhes?token=' + token + "&id=" + id,
            }).done(function(data){
                var name = data.data.name;
                var phone = data.data.phone;

                $("#edit_modal").find("input[name='name']").val(name);
                $("#current_contact_editing").html(name);

                var count_email = data.data.email.length;
                for (var i = 0; i < count_email; i++) {
                    $("#edit_modal").find("#email-group").append(
                        '<div class="input-field col s12">' +
                            '<i class="material-icons prefix">email</i>' +
                            '<input id="email" type="email" name="email-'+i+'" value="'+data.data.email[i]+'">'+
                        '</div>'
                    );
                }

                var count_phone = data.data.phone.length;
                for (var i = 0; i < count_phone; i++) {
                    $("#edit_modal").find("#phone-group").append(
                        '<div class="input-field col s12">' +
                            '<i class="material-icons prefix">phone</i>' +
                            '<input id="phone" type="tel" name="phone-'+i+'" value="'+data.data.phone[i]+'">' +
                        '</div>'
                    );
                }

                $("#edit_modal").modal('open');
            })
            .fail(function(data) {
                toastr.error('Não foi possível recuperar os dados do Contato.', {timeOut: 5000});
            });;
        },

        updateItem: function(name, array_email, array_phone, id){
            var name = name,
            array_email = array_email,
            array_phone = array_phone,
            id = id

            if(name != ''){
                $.ajax({
                    dataType: 'json',
                    type:'POST',
                    contentType: "application/x-www-form-urlencoded",
                    url: base_url + "salvar",
                    data:{
                        name:  name,
                        email: array_email,
                        phone: array_phone,
                        token: token,
                        id:id
                    }
                }).done(function(data){
                    $(".modal").modal('close');
                    toastr.success('Contato Atualizado com Sucesso.', {timeOut: 5000});
                    var current_edit_page = $("#current-page").html();
                    that.getPageData(current_edit_page);
                })
                .fail(function(data) {
                    toastr.error('Não foi possível atualizar o Contato.', {timeOut: 5000});
                });
            }else{
                toastr.error('Desculpe, Não conseguimos Atualizar o registro.', {timeOut: 5000});
            }
        },

        viewContact: function(id){
            var id = id;
            $("#contact_property_email").html('');
            $("#contact_property_phone").html('');
            $.ajax({
                dataType: 'json',
                url: base_url + 'detalhes?token=' + token + "&id=" + id,
            }).done(function(data){
                var name = data.data.name;
                $("#current_contact_viewing").html(name);

                var count_email = data.data.email.length;
                var email_data = ((count_email > 1) ? "E-mails" : "E-mail");
                $("#contact-email-data").find("h5").html(email_data);
                for (var i = 0; i < count_email; i++) {
                    $("#contact_view_modal").find("#contact_property_email").append(
                        '<li class="collection-item">' +
                            '<div>' + data.data.email[i] +
                                '<a href="#!" class="secondary-content">'+
                                    '<i class="material-icons">email</i>' +
                                '</a>' +
                            '</div>' +
                        '</li>'
                    );
                }

                var count_phone = data.data.phone.length;
                var phone_data = ((count_phone > 1) ? "Telefones" : "Telefone");
                $("#contact-phone-data").find("h5").html(phone_data);
                for (var i = 0; i < count_phone; i++) {
                    $("#contact_view_modal").find("#contact_property_phone").append(
                        '<li class="collection-item">' +
                            '<div>' + data.data.phone[i] +
                                '<a href="#!" class="secondary-content">'+
                                    '<i class="material-icons">phone</i>' +
                                '</a>' +
                            '</div>' +
                        '</li>'
                    );
                }

                $("#contact_view_modal").modal('open');
            })
            .fail(function(data) {
                toastr.error('Não foi possível recuperar os dados do Contato.', {timeOut: 5000});
            });;
        },

         SearchQuery: function (search_key) {
            var searchText = search_key;
            $.each($("#table tbody tr"), function() {
                if($(this).text().toLowerCase().indexOf(searchText) === -1)
                   $(this).hide();
                else
                   $(this).show();
            });
        }

    }; // Contact Object

    Contact.init({});
});
