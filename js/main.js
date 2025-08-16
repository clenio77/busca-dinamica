$(document).ready(function() {
    // Foca no campo de entrada quando a página carrega
    $("#input").focus();

    // Anexa a função filter ao evento keyup
    $("#input").on("keyup", filter);

    // Limpa o campo de entrada ao pressionar Enter, apenas se não for um envio de formulário
    $('#input').on('keydown', function(e) {
        if (e.which === 13) { // Verifica a tecla Enter
            e.preventDefault(); // Previne o comportamento padrão de envio de formulário, se estiver dentro de um
            // Você pode adicionar outra lógica aqui se necessário para a tecla Enter, por exemplo, selecionar o primeiro item
            $(this).val(''); // Limpa o campo de entrada
            filter(); // Executa o filtro novamente para esconder tudo
        }
    });
});

function filter() {
    var input, filterValue, ul, li, a, i, txtValue;
    input = document.getElementById("input");
    filterValue = input.value.toUpperCase();
    ul = document.getElementById("ul");
    li = ul.getElementsByTagName("li");

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText; // Obtém todo o conteúdo de texto da tag <a>

        if (!filterValue) {
            li[i].style.display = "none"; // Oculta todos se o input estiver vazio
        } else if (txtValue.toUpperCase().indexOf(filterValue) > -1) {
            li[i].style.display = "flex"; // Usa flex para corresponder ao CSS
        } else {
            li[i].style.display = "none";
        }
    }
}