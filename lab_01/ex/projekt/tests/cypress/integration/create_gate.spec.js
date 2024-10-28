describe( 'Create gate', () => {
    it( 'should allow people to create project', () => {
        cy.visit('http://127.0.0.1:5500/');
        cy.get('#open-create-project-menu').click();
        cy.get('#project-name').type('test project');
        cy.get('#create-project').click();
    });
    
    it( 'should allow people to create gate', () => {
        cy.get('#1drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 20, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 20, clientY: 200 });

        cy.get('#8drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 200, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 200, clientY: 200 });

        cy.get('#9drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 500, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 500, clientY: 200 });

        cy.get('#4drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 800, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 800, clientY: 200 });

        cy.get('#0-1-gate-o').trigger('mousedown');
        cy.get('#0-3-gate-i').trigger('mouseup');

        cy.get('#0-2-gate-o').trigger('mousedown');
        cy.get('#1-3-gate-i').trigger('mouseup');

        cy.get('#0-3-gate-o').trigger('mousedown');
        cy.get('#0-4-gate-i').trigger('mouseup');

        cy.get('#0-4-gate-o').trigger('mousedown');
        cy.get('#0-5-gate-i').trigger('mouseup');

        cy.get('#create-gate-menu-button').click();
        cy.get('#name').type('NAND');
        cy.get('#create-gate-button').click();

        cy.get('#10drag')
            .contains('NAND')
            .should('be.visible');
    });

    it( 'check output value of NAND Gate', () => {
        cy.get('#1drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 20, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 20, clientY: 200 });
        
        cy.get('#10drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 200, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 200, clientY: 200 });

        cy.get('#4drag').trigger('mousedown');
        cy.get('body').trigger('mousemove', { clientX: 500, clientY: 200 });
        cy.get('body').trigger('mouseup', { clientX: 500, clientY: 200 });

        cy.get('#0-7-gate-o').trigger('mousedown');
        cy.get('#0-9-gate-i').trigger('mouseup');
        
        cy.get('#0-8-gate-o').trigger('mousedown');
        cy.get('#1-9-gate-i').trigger('mouseup');

        cy.get('#0-9-gate-o').trigger('mousedown');
        cy.get('#0-10-gate-i').trigger('mouseup');

        cy.get('#0-10-gate-i').should('satisfy', ($el) => {
            const classList = Array.from($el[0].classList); 
            return classList.includes('true');
        });

        cy.get('#0-7-gate-o').dblclick();
        cy.get('#0-10-gate-i').should('satisfy', ($el) => {
            const classList = Array.from($el[0].classList); 
            return classList.includes('true');
        });
        cy.get('#0-7-gate-o').dblclick();

        cy.get('#0-8-gate-o').dblclick();
        cy.get('#0-10-gate-i').should('satisfy', ($el) => {
            const classList = Array.from($el[0].classList); 
            return classList.includes('true');
        });

        cy.get('#0-7-gate-o').dblclick();
        cy.get('#0-10-gate-i').should('satisfy', ($el) => {
            const classList = Array.from($el[0].classList); 
            return classList.includes('false');
        });
    });
});